# CareSync — Cloud-Native Healthcare Platform

> A production-grade, HIPAA-aligned healthcare management system built on AWS, orchestrated with Kubernetes, and deployed via a fully automated GitOps CI/CD pipeline.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Application Layer — `caresync-app`](#3-application-layer--caresync-app)
   - [Shared Library](#31-shared-library-caresyncshared)
   - [Auth Service](#32-auth-service--port-3001)
   - [User Service](#33-user-service--port-3002)
   - [Appointment Service](#34-appointment-service--port-3003)
   - [Document Service](#35-document-service--port-3004)
   - [Notification Service](#36-notification-service--port-3005)
   - [AI Service](#37-ai-service--port-3006)
   - [Frontend](#38-frontend-react--vite)
   - [Database Schema](#39-database-schema-postgresql--prisma)
   - [CI/CD Workflows](#310-cicd-workflows)
4. [Infrastructure Layer — `caresync-infra`](#4-infrastructure-layer--caresync-infra)
   - [Networking — VPC](#41-networking--vpc)
   - [Compute — EKS](#42-compute--eks)
   - [Database — RDS PostgreSQL](#43-database--rds-postgresql)
   - [Storage — S3](#44-storage--s3)
   - [Messaging — SQS](#45-messaging--sqs)
   - [Security — KMS, Secrets Manager, WAF](#46-security--kms-secrets-manager-waf)
   - [DNS & Certificates — Route53, ACM](#47-dns--certificates--route53-acm)
   - [Email — SES](#48-email--ses)
   - [Serverless — Lambda (Appointment Reminder)](#49-serverless--lambda-appointment-reminder)
   - [IAM & IRSA](#410-iam--irsa)
   - [Observability — CloudWatch](#411-observability--cloudwatch)
   - [Container Registry — ECR](#412-container-registry--ecr)
   - [Kubernetes Add-ons](#413-kubernetes-add-ons)
   - [Terraform Backend](#414-terraform-backend)
   - [Infrastructure CI/CD](#415-infrastructure-cicd)
5. [GitOps Layer — `caresync-gitops`](#5-gitops-layer--caresync-gitops)
   - [Helm Chart Architecture](#51-helm-chart-architecture)
   - [Kubernetes Manifests](#52-kubernetes-manifests)
   - [Networking — Gateway API & ALB Ingress](#53-networking--gateway-api--alb-ingress)
   - [External Secrets](#54-external-secrets)
   - [Network Policies](#55-network-policies)
   - [ArgoCD Application](#56-argocd-application)
6. [End-to-End CI/CD Flow](#6-end-to-end-cicd-flow)
7. [Security Architecture](#7-security-architecture)
8. [Environment Variables & Secrets](#8-environment-variables--secrets)
9. [Tech Stack Summary](#9-tech-stack-summary)

---

## 1. Project Overview

CareSync is a **multi-role healthcare management platform** serving three user personas: **Patients**, **Doctors**, and **Admins**. It is composed of 6 independent backend microservices and a React single-page application (SPA) frontend.

The platform is deployed entirely on AWS, with all infrastructure defined as code using **Terraform**, all Kubernetes workloads declared in **Helm charts** tracked in a GitOps repo, and continuous delivery managed by **ArgoCD**. Every push to `main` in `caresync-app` triggers a fully automated pipeline — from code scanning through to production deployment — with a **manual approval gate** protecting the final push to production.

**Live Domain:** `https://caresync-project.online`  
**AWS Account:** `664685894054`  
**AWS Region:** `us-east-1`  
**EKS Cluster:** `caresync-prod`  
**Kubernetes Namespace:** `caresync-prod`

---

## 2. Repository Structure

The project is split into three separate GitHub repositories under the `care-sync-org` organization:

| Repository | Purpose |
|---|---|
| `care-sync-org/caresync-app` | All microservice source code, Dockerfiles, and CI/CD workflows |
| `care-sync-org/caresync-infra` | Terraform IaC for all AWS infrastructure |
| `care-sync-org/caresync-gitops` | Helm charts and ArgoCD manifests for Kubernetes deployment |

```
aws-final-project/
├── caresync-app/          # Microservices monorepo
│   ├── ai-service/
│   ├── appointment-service/
│   ├── auth-service/
│   ├── document-service/
│   ├── frontend/
│   ├── notification-service/
│   ├── user-service/
│   └── .github/workflows/
│       ├── build.yml      # Main CI pipeline (lint, SAST, scan, build, push)
│       └── deploy.yml     # GitOps update & ArgoCD trigger
│
├── caresync-infra/        # Terraform IaC
│   ├── terraform/
│   │   ├── environments/prod/
│   │   └── modules/       # 19 reusable Terraform modules
│   └── .github/workflows/
│       └── terraform-apply.yml
│
└── caresync-gitops/       # GitOps source of truth
    ├── gitops/apps/        # ArgoCD Application manifests
    ├── helm/
    │   ├── Chart.yaml
    │   ├── values.yaml          # Base configuration
    │   ├── values-prod.yaml     # Production overrides (auto-updated by CI)
    │   └── templates/           # Per-service Kubernetes manifests
    └── scripts/
```

---

## 3. Application Layer — `caresync-app`

### Technology Foundation

All backend services share a common design pattern:
- **Language:** TypeScript
- **Runtime:** Node.js 22
- **Framework:** Express.js
- **ORM:** Prisma (connected to a shared PostgreSQL RDS instance)
- **Container Base Image:** `node:22-alpine`
- **Startup:** Each service runs `initSecrets()` from the shared library to pull AWS Secrets Manager values before connecting to the database.

Each service has a `shared/` directory that is a symlink-like local copy of the `@caresync/shared` library, bundled for the Docker build context.

---

### 3.1 Shared Library (`@caresync/shared`)

**Path:** `<service>/shared/`  
**Version:** `1.0.0`

The shared library is a private internal package that every microservice depends on (`"@caresync/shared": "file:./shared"`). It provides:

| Export | Purpose |
|---|---|
| `initSecrets()` | Fetches all secrets from AWS Secrets Manager and injects them into `process.env` at startup |
| `prisma` | A shared Prisma client instance — all services connect to the **same** PostgreSQL database |
| `authenticateToken` | Express middleware — validates JWT Bearer tokens from the `Authorization` header |
| `requireRole(roles[])` | Express middleware — enforces RBAC; throws 403 if the authenticated user's role is not in the allowed list |
| `globalErrorHandler` | Centralized Express error-handling middleware |
| `notFoundHandler` | Catches unmatched routes and returns a structured 404 |
| `createStorageProvider()` | Factory that returns an S3-backed file storage abstraction |
| `createQueueProvider()` | Factory that returns an SQS-backed message queue abstraction |
| `uploadMiddleware` | Multer v2.x middleware for handling `multipart/form-data` file uploads |

**Key Dependencies in Shared:**
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` — S3 file operations
- `@aws-sdk/client-secrets-manager` — Secret injection
- `@prisma/client` — Database ORM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT signing/verification
- `multer ^2.2.0` — File upload middleware
- `zod` — Runtime schema validation

---

### 3.2 Auth Service — Port `3001`

**ECR Repo:** `caresync/auth-service`  
**API Base Path:** `/api/auth`

Handles all authentication and session management for the platform.

**Middleware Stack:**
- `helmet` — Security headers
- `cors` — Cross-origin policies
- `compression` — Response compression
- `cookie-parser` — Cookie management
- `morgan` — HTTP request logging
- `express-rate-limit` — 100 requests per 15-minute window per IP (applied only to `/api/auth`)

**API Endpoints:**

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new patient account. Hashes password with `bcryptjs`, creates `User` + `Patient` records in the DB. |
| `POST` | `/api/auth/login` | No | Authenticate credentials, return signed JWT access token and refresh token. |
| `POST` | `/api/auth/refresh` | No | Exchange a valid refresh token for a new access token. |
| `POST` | `/api/auth/logout` | Yes (JWT) | Invalidate the current session/refresh token. |
| `GET` | `/api/auth/me` | Yes (JWT) | Return the authenticated user's profile from the JWT claims. |
| `GET` | `/api/auth/health` | No | Health check. |

---

### 3.3 User Service — Port `3002`

**ECR Repo:** `caresync/user-service`  
**API Base Paths:** `/api/patients`, `/api/doctors`, `/api/admin`

Manages all user profile data and role-specific operations for patients, doctors, and administrators.

**Patient Routes (`/api/patients`):**

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/patients/profile` | PATIENT | Fetch own patient profile (DOB, gender, blood group, emergency contact, etc.) |
| `PUT` | `/api/patients/profile` | PATIENT | Update own patient profile |
| `GET` | `/api/patients/appointments` | PATIENT | Get all appointments for the current patient |
| `GET` | `/api/patients` | ADMIN, DOCTOR | List all patients |
| `GET` | `/api/patients/:id` | ADMIN, DOCTOR | Get a specific patient by ID |

**Doctor Routes (`/api/doctors`):**

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Any authenticated | List all available doctors (used by patients when booking) |
| `GET` | `/api/doctors/profile` | DOCTOR | Fetch own doctor profile (specialization, license, department, bio) |
| `PUT` | `/api/doctors/profile` | DOCTOR | Update own doctor profile |
| `GET` | `/api/doctors/appointments` | DOCTOR | Get all appointments assigned to the current doctor |
| `GET` | `/api/doctors/:id` | Any authenticated | Get a specific doctor by ID |

**Admin Routes (`/api/admin`):**

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | ADMIN | Dashboard statistics (total users, appointments, etc.) |
| `GET` | `/api/admin/users` | ADMIN | List all users across all roles |
| `PATCH` | `/api/admin/users/:id/toggle-status` | ADMIN | Enable or disable a user account (`isActive` flag) |
| `POST` | `/api/admin/doctors` | ADMIN | Create a new doctor account (Admin-only operation) |
| `GET` | `/api/admin/audit-logs` | ADMIN | Retrieve the full audit log trail |

---

### 3.4 Appointment Service — Port `3003`

**ECR Repo:** `caresync/appointment-service`  
**API Base Paths:** `/api/appointments`, `/api/records`

Handles the core scheduling domain and medical record creation.

**Appointment Routes (`/api/appointments`):**

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | PATIENT | Create a new appointment (requires `doctorId`, `scheduledAt`, `reason`) |
| `GET` | `/api/appointments` | ADMIN | Get all appointments across all patients/doctors |
| `GET` | `/api/appointments/:id` | Any authenticated | Get a single appointment's full details |
| `PATCH` | `/api/appointments/:id` | Any authenticated | Update appointment status (SCHEDULED → CONFIRMED → COMPLETED/CANCELLED) |

**Medical Record Routes (`/api/records`):**

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/api/records` | DOCTOR | Create a medical record linked to a completed appointment (diagnosis, treatment, prescription, follow-up date) |
| `GET` | `/api/records/my` | PATIENT | Retrieve all medical records belonging to the current patient |
| `GET` | `/api/records/:id` | Any authenticated | Get a specific medical record |
| `PATCH` | `/api/records/:id` | DOCTOR | Update a medical record (add/edit notes, prescription, etc.) |

**Appointment Statuses:** `SCHEDULED → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW`

---

### 3.5 Document Service — Port `3004`

**ECR Repo:** `caresync/document-service`  
**API Base Path:** `/api/documents`

Handles all medical document file management. Supports both direct multipart upload and a presigned S3 URL workflow for large files.

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/documents/presigned-url` | Yes | Generate a presigned S3 PUT URL for client-side direct upload to S3 (for large files) |
| `POST` | `/api/documents/confirm-upload` | Yes | After a client-side S3 upload, call this to create the `Document` record in the database and trigger AI summarization via an internal HTTP call to the AI service (`POST /internal/summarize`) |
| `POST` | `/api/documents` | Yes | Direct server-side upload using `multipart/form-data` (Multer middleware). Uploads to S3, saves metadata to DB, triggers AI summarization |
| `GET` | `/api/documents` | Yes | List all documents owned by the current user |
| `GET` | `/api/documents/:id/download` | Yes | Generate a presigned S3 GET URL for secure, time-limited file download |
| `DELETE` | `/api/documents/:id` | Yes | Delete a document from S3 and remove its database record |

After every upload, the Document Service calls the AI Service's internal endpoint (`/internal/summarize`) with the new `documentId`. This triggers asynchronous AI summarization.

---

### 3.6 Notification Service — Port `3005`

**ECR Repo:** `caresync/notification-service`  
**API Base Path:** `/api/notifications`

Manages in-app notifications. Notification records are written to the database by other services (e.g., when an appointment is created, or a document is uploaded) and read through this service.

**Notification Types (Enum):**
- `APPOINTMENT_CREATED`
- `APPOINTMENT_CONFIRMED`
- `APPOINTMENT_CANCELLED`
- `APPOINTMENT_COMPLETED`
- `DOCUMENT_UPLOADED`
- `RECORD_ADDED`
- `SYSTEM`

**Key Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Yes | Get all notifications for the current user |
| `PATCH` | `/api/notifications/:id/read` | Yes | Mark a single notification as read |
| `PATCH` | `/api/notifications/read-all` | Yes | Mark all of the current user's notifications as read |

---

### 3.7 AI Service — Port `3006`

**ECR Repo:** `caresync/ai-service`  
**Internal Endpoint:** `/internal/summarize` (not publicly exposed via the Gateway)

The AI Service provides **automated medical document summarization** powered by **AWS Bedrock** (Amazon Nova Lite model: `amazon.nova-lite-v1:0`). It is a background processing service — it does not serve end-user requests directly.

**Processing Pipeline:**

```
Document uploaded (Document Service)
    │
    ▼
POST /internal/summarize { documentId }
    │
    ▼ (async, returns 202 Accepted immediately)
1. Fetch document record from DB (Prisma)
2. Validate MIME type (supports PDF and text/plain only)
3. Update aiSummaryStatus = "PROCESSING"
4. Download file buffer from S3 (via shared StorageProvider)
5. Extract text:
   - text/plain → direct buffer decode
   - application/pdf → pdf-parse library
6. Truncate to 10,000 characters (token boundary protection)
7. Invoke Bedrock (Amazon Nova Lite) with structured medical prompt:
   - Extracts key findings
   - Highlights abnormal lab values
   - Appends mandatory medical disclaimer
   - Does NOT diagnose or prescribe
8. Save summaryText to Document.aiSummary
9. Update aiSummaryStatus = "COMPLETED"
```

**SQS Worker (Alternative Trigger):**  
When `QUEUE_PROVIDER=sqs` is set, a long-polling SQS worker (`startSqsWorker`) also runs alongside the HTTP server. It continuously polls the `ai-summary` SQS queue, processes any queued `documentId` messages through the same summarization pipeline, and deletes messages on success (leaving them to retry via visibility timeout on failure).

**AI Summary Statuses:** `PENDING → PROCESSING → COMPLETED | FAILED`

---

### 3.8 Frontend (React + Vite)

**ECR Repo:** `caresync/frontend`  
**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS  
**Served by:** Nginx on port 80

The frontend is a React SPA with role-based routing that renders completely different UIs depending on whether the logged-in user is a `PATIENT`, `DOCTOR`, or `ADMIN`.

**Pages & UI Modules:**

#### Authentication Pages
| Page | Path | Description |
|---|---|---|
| Login | `/login` | Email + password login form. Stores JWT in memory/localStorage. |
| Register | `/register` | New patient self-registration form (name, email, password). |

#### Patient Portal
| Page | Path | Description |
|---|---|---|
| Patient Dashboard | `/patient/dashboard` | Overview card showing upcoming appointments, recent notifications, and quick links. |
| Patient Appointments | `/patient/appointments` | Full appointments list with status badges. Patients can book new appointments by selecting a doctor, date/time, and entering a reason. Appointments can be cancelled from this view. |
| Patient Documents | `/patient/documents` | Document management: upload medical files (PDF, text), view upload history, download documents, view AI-generated summaries inline with status indicators (PENDING / PROCESSING / COMPLETED / FAILED). |
| Patient Medical Records | `/patient/records` | Read-only view of all medical records created by doctors during/after appointments (diagnosis, treatment, prescription, follow-up date). |

#### Doctor Portal
| Page | Path | Description |
|---|---|---|
| Doctor Dashboard | `/doctor/dashboard` | Overview of today's appointments, patient count, and quick-action cards. |
| Doctor Appointments | `/doctor/appointments` | Full list of appointments assigned to the logged-in doctor. Doctors can update appointment status (confirm, mark complete, mark no-show, cancel). |
| Doctor Records | `/doctor/records` | Medical records management. Doctors can create new medical records attached to a completed appointment, and edit existing records (add diagnosis, notes, treatment, prescription, follow-up date). This is the most complex UI page (~12 KB). |

#### Admin Portal
| Page | Path | Description |
|---|---|---|
| Admin Dashboard | `/admin/dashboard` | Platform-wide statistics: total users, total appointments by status, new registrations over time. |
| Admin Users | `/admin/users` | Full user management table: view all users (patients and doctors), filter by role, enable/disable accounts, and create new doctor accounts (name, email, password, specialization, license number, department). |
| Admin Appointments | `/admin/appointments` | View all appointments across all patients and doctors with filtering by status. |
| Admin Audit Logs | `/admin/audit-logs` | Chronological audit trail of all significant actions performed in the system (who did what, on which resource, with IP address and user agent). |

**Frontend Architecture:**
- `src/api/` — Axios-based API clients (one per service domain)
- `src/contexts/` — React Context providers (AuthContext for user state)
- `src/hooks/` — Custom React hooks
- `src/components/Layout/` — Shared layout shell with role-aware navigation sidebar
- `src/components/ProtectedRoute.tsx` — Route guard that redirects unauthenticated users and enforces role-based access
- `src/types/` — TypeScript type definitions mirroring the backend Prisma schema
- `nginx.conf` — Nginx configuration for SPA fallback routing (`try_files $uri /index.html`)

---

### 3.9 Database Schema (PostgreSQL + Prisma)

All microservices share a **single PostgreSQL database** (`caresync_prod`) on RDS. The schema is managed via Prisma migrations shared from the `ai-service/prisma/` directory (used as the canonical schema location).

**Tables:**

| Table | Key Fields | Description |
|---|---|---|
| `users` | `id`, `email`, `password`, `role` (ADMIN/DOCTOR/PATIENT), `firstName`, `lastName`, `isActive` | Base user account for all roles |
| `patients` | `userId`, `dateOfBirth`, `gender`, `bloodGroup`, `emergencyContact`, `phone`, `address` | Patient-specific profile data (1:1 with User) |
| `doctors` | `userId`, `specialization`, `licenseNumber`, `department`, `bio`, `isAvailable` | Doctor-specific profile data (1:1 with User) |
| `appointments` | `patientId`, `doctorId`, `scheduledAt`, `status`, `reason`, `notes`, `duration` | Scheduling entity linking patients and doctors |
| `medical_records` | `appointmentId`, `patientId`, `doctorId`, `diagnosis`, `treatment`, `prescription`, `followUpDate` | Clinical record created by doctor post-appointment |
| `documents` | `userId`, `filename`, `storageKey`, `mimeType`, `size`, `aiSummary`, `aiSummaryStatus` | File metadata for uploaded medical documents |
| `notifications` | `userId`, `type`, `title`, `message`, `isRead`, `metadata` | In-app notification records |
| `audit_logs` | `userId`, `action`, `resource`, `resourceId`, `details`, `ipAddress`, `userAgent` | Immutable activity audit trail |

**Relations:**
- User → Patient (1:1), User → Doctor (1:1)
- Patient ↔ Doctor → Appointment (Many-to-Many via Appointment table)
- Appointment → MedicalRecord (1:1)
- MedicalRecord → Document[] (1:Many)
- User → Document[] (1:Many)
- User → Notification[] (1:Many)
- User → AuditLog[] (1:Many)

---

### 3.10 CI/CD Workflows

#### `build.yml` — Build, Scan & Push

**Trigger:**  
- Push to `main` → builds ALL 7 services (consistent production SHA)  
- Push to `dev` → builds ONLY changed services (detected via `dorny/paths-filter`)  
- PR to `main` → builds and scans only, NO push to ECR  
- Manual trigger (`workflow_dispatch`) → builds all services

**Pipeline Jobs (Sequential):**

```
detect-changes
    │
    ├── sonarcloud (parallel per service) — SonarCloud SAST analysis
    │
    ├── snyk (parallel per service) — Snyk SCA dependency vulnerability scan
    │       (reports uploaded as GitHub Actions artifacts, continue-on-error)
    │
    ├── build-scan-push (parallel per service)
    │       - Build Docker image for linux/amd64
    │       - Run Trivy (CRITICAL + HIGH; OS + library vulnerabilities)
    │       - Push to ECR with 3 tags: semantic (v1.x.x), SHA (prod-8f3a2b1), latest
    │
    └── trigger-deploy (only on main push, only if all builds succeed)
            - Dispatches deploy.yml with semantic_tag, sha_tag, services[]
```

**Image Tagging Strategy:**
- `prod-<short-sha>` — Immutable, traceable SHA-based tag
- `v<major>.<minor>.<patch>` — Semantic version (auto-incremented via `mathieudutour/github-tag-action`)
- `latest` — Rolling convenience tag

**Security Scan Reports:**  
Both Snyk HTML reports and Trivy text reports are uploaded as GitHub Actions artifacts with a 14-day retention policy. Email failure alerts are sent via Gmail SMTP on any job failure.

#### `deploy.yml` — Update GitOps & Trigger ArgoCD

**Trigger:** Dispatched by `build.yml` after a successful main push build.

**Flow:**

```
1. Send approval request email to ALERT_EMAIL
2. Wait for manual approval in GitHub "production" environment gate
3. (On approval) Checkout caresync-gitops using MANIFEST_REPO_PAT
4. Install yq (YAML processor)
5. Update helm/values-prod.yaml — set image tag = SHA tag for each service
6. Commit and push to caresync-gitops main branch
7. ArgoCD detects the change and auto-syncs within ~3 minutes
8. Send success or failure notification email
```

---

## 4. Infrastructure Layer — `caresync-infra`

All AWS infrastructure is defined as Terraform code organized into **19 reusable modules**. The production environment is declared in `terraform/environments/prod/main.tf` and stored in an S3 backend with native locking.

**Terraform Version:** `>= 1.5.0`  
**AWS Provider:** `~> 5.0`  
**State Backend:** S3 bucket `caresync-prod-tfstate-664685894054`, key `prod/terraform.tfstate`, encryption enabled

---

### 4.1 Networking — VPC

**Module:** `modules/vpc`

| Resource | Detail |
|---|---|
| VPC CIDR | `10.0.0.0/16` |
| Availability Zones | Multiple (us-east-1a, 1b, 1c) |
| Public Subnets | For ALB (internet-facing load balancer) |
| Private Subnets | For EKS worker nodes |
| Database Subnets | Isolated, no internet route, for RDS |
| NAT Gateway | Single NAT (`single_nat = true`) — cost optimized for this environment |
| Internet Gateway | For public subnet egress |
| Tags | EKS-aware subnet tags for ALB controller auto-discovery |

---

### 4.2 Compute — EKS

**Module:** `modules/eks`  
**Cluster Name:** `caresync-prod`

| Setting | Value |
|---|---|
| Node Instance Type | `t3.medium` |
| Min Nodes | `2` |
| Max Nodes | `3` |
| Desired Nodes | `3` |
| Node Placement | Private subnets only |
| Envelope Encryption | KMS-encrypted etcd secrets |
| OIDC Provider | Enabled — powers IRSA (IAM Roles for Service Accounts) |
| Cluster Access | IAM principal-based access entries (no deprecated `aws-auth` ConfigMap) |

A `time_sleep` resource introduces a 120-second pause after EKS creation before any Kubernetes resources are applied, ensuring the API server is fully ready.

---

### 4.3 Database — RDS PostgreSQL

**Module:** `modules/rds`

| Setting | Value |
|---|---|
| Engine | PostgreSQL |
| Database Name | `caresync_prod` |
| Username | `postgres` |
| Password | Auto-generated, stored in Secrets Manager |
| Multi-AZ | `false` (single-AZ, cost-optimized for this project) |
| Subnets | Database-isolated subnets (no public route) |
| Security Group | Allows inbound 5432 only from EKS node security group |
| Encryption | KMS key (`module.kms.key_arn`) |

The RDS endpoint and generated password are automatically passed into the `secrets-manager` module to construct the `DATABASE_URL` connection string.

---

### 4.4 Storage — S3

**Module:** `modules/s3`  
**Bucket Prefix:** `caresync-docs-prod-`

The S3 bucket stores all uploaded medical documents. Key configurations:
- **KMS Server-Side Encryption** using the project KMS key
- **Bucket Policy** restricts access to the IRSA role used by document-service and ai-service pods
- Presigned URL support for direct client-side uploads (time-limited, secure)

---

### 4.5 Messaging — SQS

**Module:** `modules/sqs`

An SQS queue named `ai-summary` is used to trigger asynchronous AI document summarization jobs. Features:
- **KMS Encryption** for messages at rest
- **Dead Letter Queue (DLQ)** — failed messages moved to DLQ after max retries
- The AI service SQS worker polls this queue continuously with long-polling (20-second wait time, up to 10 messages per batch)

---

### 4.6 Security — KMS, Secrets Manager, WAF

**KMS (`modules/kms`):**  
A single customer-managed KMS key (`alias: caresync-prod`) encrypts all sensitive data: EKS secrets, RDS database, S3 documents, SQS messages, and Secrets Manager secrets. Automatic key rotation is enabled.

**Secrets Manager (`modules/secrets-manager`):**  
A single secret `caresync/app-secrets-prod` stores all application secrets as key-value pairs:
- `DATABASE_URL` — Full PostgreSQL connection string (auto-constructed from RDS endpoint + password)
- `JWT_SECRET` — JWT signing key
- `SQS_QUEUE_URL` — AI summarization queue URL
- `S3_BUCKET_NAME` — Document storage bucket name
- `FRONTEND_URL` — `https://caresync-project.online`
- `API_BASE_URL` — `https://caresync-project.online/api`
- `SES_FROM_EMAIL` — Verified sender email address
- `NOTIFICATION_EMAIL` — Admin alert recipient

These secrets are synced into Kubernetes as a native `Secret` object by External Secrets Operator, then mounted as `envFrom: secretRef` in every pod.

**WAF (`modules/waf`):**  
An AWS WAFv2 Regional Web ACL (`CareSync-prod-waf`) is attached to the Application Load Balancer. It uses AWS managed rule groups to protect against:
- Common web exploits (XSS, SQL injection)
- Known bad inputs
- Rate-based rules for DDoS mitigation

The WAF ACL ARN is passed into the Helm chart (`waf_acl_arn`) and applied as an annotation on the ALB Ingress resource.

---

### 4.7 DNS & Certificates — Route53, ACM

**Route53 (`modules/route53`):**  
A public hosted zone is managed for `caresync-project.online`. ExternalDNS (running on EKS) automatically creates and updates `A` records pointing to the ALB when the Ingress resource is applied.

**ACM (`modules/acm`):**  
An ACM certificate is provisioned for `caresync-project.online` with DNS validation (validation records auto-created in the Route53 hosted zone). The ALB controller auto-discovers this certificate via host matching.

---

### 4.8 Email — SES

**Module:** `modules/ses`

Amazon SES is configured with a verified sender identity (`nandanasuresh2468@gmail.com`) for the appointment reminder Lambda function to send email notifications to patients.

---

### 4.9 Serverless — Lambda (Appointment Reminder)

**Module:** `modules/lambda`  
**Runtime:** Node.js (ESM `.mjs`)  
**Schedule:** EventBridge rule on `rate(1 hour)`

A serverless Lambda function runs on a recurring schedule to send appointment reminder emails. 

**Logic:**
1. Query the `appointments` table in RDS for appointments scheduled within the next 24 hours with `SCHEDULED` or `CONFIRMED` status
2. For each upcoming appointment, look up the patient's email and doctor's name from the `users` table
3. Send a formatted reminder email via AWS SES to the patient
4. Log reminder activity

**Configuration:**
- Deployed in private VPC subnets (can reach RDS)
- Security group allows only outbound HTTPS (to SES endpoints)
- IAM role with permissions: `secretsmanager:GetSecretValue`, `ses:SendEmail`, `kms:Decrypt`
- Database connection string fetched from Secrets Manager at cold start

---

### 4.10 IAM & IRSA

**Module:** `modules/iam-irsa`

IAM Roles for Service Accounts (IRSA) is the mechanism by which Kubernetes pods assume AWS IAM roles without using static credentials. Each sensitive service has its own dedicated role:

| IRSA Role | Used By | Permissions |
|---|---|---|
| `albc` | ALB Controller pod | `elasticloadbalancing:*`, `ec2:*`, `iam:CreateServiceLinkedRole` |
| `external_dns` | ExternalDNS pod | `route53:ChangeResourceRecordSets`, `route53:ListHostedZones`, `route53:ListResourceRecordSets` |
| `external_secrets` | External Secrets Operator pod | `secretsmanager:GetSecretValue`, `kms:Decrypt` |
| `app_services` | All microservice pods | `s3:*` (scoped to docs bucket), `sqs:*` (scoped to ai-summary queue), `bedrock:InvokeModel`, `secretsmanager:GetSecretValue`, `kms:Decrypt` |

The trust policy for each role is scoped to the specific Kubernetes service account in the `caresync-prod` namespace using the EKS OIDC provider.

---

### 4.11 Observability — CloudWatch

**Module:** `modules/cloudwatch`

CloudWatch alarms are configured for:
- **EKS:** Container-level CPU and memory metrics (via Container Insights)
- **RDS:** CPU utilization, database connections, free storage space
- **SQS DLQ:** Alert when any message lands in the Dead Letter Queue (indicates a failed AI summarization)
- **SNS Topic:** All alarms publish to an SNS topic that triggers an email notification (via Lambda) to the admin

---

### 4.12 Container Registry — ECR

**Module:** `modules/ecr`

Private ECR repositories are provisioned for all 7 services:
- `caresync/ai-service`
- `caresync/appointment-service`
- `caresync/auth-service`
- `caresync/document-service`
- `caresync/frontend`
- `caresync/notification-service`
- `caresync/user-service`

Image scanning on push is enabled. Image tags are immutable to prevent accidental overwrites.

---

### 4.13 Kubernetes Add-ons

The following cluster add-ons are deployed via Terraform `helm_release` resources (applied after EKS is ready):

| Add-on | Namespace | Version | Purpose |
|---|---|---|---|
| AWS Load Balancer Controller | `kube-system` | Latest | Provisions and manages AWS ALBs for Kubernetes Ingress resources |
| ExternalDNS | `kube-system` | Latest | Automatically creates/updates Route53 DNS records from Ingress/Service annotations |
| External Secrets Operator | `external-secrets` | `0.9.9` | Syncs AWS Secrets Manager values into Kubernetes Secrets |
| Metrics Server | `kube-system` | `3.12.1` | Provides resource metrics API (required for HPA) |
| kgateway (Gloo Gateway CRDs) | `kube-system` | `v2.0.1` | Kubernetes Gateway API implementation (CRDs and controller) |
| ArgoCD | `argocd` | Latest | GitOps continuous delivery — watches `caresync-gitops` and syncs manifests to the cluster |

The **Kubernetes Gateway API** standard CRDs are also installed via `kubectl apply` (`null_resource`) targeting the standard install YAML from `kubernetes-sigs/gateway-api@v1.1.0`.

---

### 4.14 Terraform Backend

**Module:** `terraform-backend/` (separate, bootstrapped first)

| Resource | Value |
|---|---|
| S3 Bucket | `caresync-prod-tfstate-664685894054` |
| Region | `us-east-1` |
| Encryption | Enabled |
| Versioning | Enabled |
| State Locking | Native S3 locking (`use_lockfile = true`) |

The backend must be bootstrapped manually before the main environment can be initialized.

---

### 4.15 Infrastructure CI/CD

**Workflow:** `.github/workflows/terraform-apply.yml`  
**Trigger:** Manual (`workflow_dispatch`) only — protects against accidental infrastructure changes.

**Jobs:**

1. **`plan`** — `terraform init` → `terraform validate` → `terraform plan -out=tfplan` → Upload `tfplan` as artifact
2. **`apply`** — Requires manual approval in the `aws-infrastructure` GitHub environment → Downloads plan artifact → `chmod -R +x .terraform/providers/` (failsafe for Linux provider permissions) → `terraform apply -auto-approve tfplan`

AWS authentication uses OIDC federation (`aws-actions/configure-aws-credentials@v4`) — no static AWS access keys are stored in GitHub Secrets.

---

## 5. GitOps Layer — `caresync-gitops`

The GitOps repository is the **single source of truth** for what is running in the Kubernetes cluster. ArgoCD continuously watches this repository and reconciles any drift between the declared state and the actual cluster state.

---

### 5.1 Helm Chart Architecture

**Chart:** `helm/Chart.yaml`

The Helm chart defines the full application stack as a single deployable unit. Two values files are layered:
- `values.yaml` — Base defaults (port numbers, secret names, gateway class, WAF ARN, service placeholder image names)
- `values-prod.yaml` — Production overrides (full ECR image URIs with AWS account ID, per-service SHA image tags, domain name, WAF ACL ARN)

The CI/CD `deploy.yml` workflow automatically updates `values-prod.yaml` (specifically the `.services.<service>.tag` fields) with the new SHA tag on every production deployment, then commits and pushes. ArgoCD detects this commit and triggers an automated sync.

---

### 5.2 Kubernetes Manifests

Each of the 7 services (6 backend + frontend) has its own set of templated Kubernetes manifests:

| Manifest | Purpose |
|---|---|
| `deployment.yaml` | Kubernetes Deployment: 2 replicas, non-root security context (`runAsUser: 1000`), init container that waits for DB on port 5432, resource requests/limits, liveness and readiness probes on `/api/health` |
| `service.yaml` | ClusterIP service (internal cluster access only) |
| `httproute.yaml` | Kubernetes Gateway API `HTTPRoute` resource — routes external traffic from the Gateway to the service |
| `hpa.yaml` | Horizontal Pod Autoscaler — scales between 2 and 5 replicas based on CPU utilization |
| `pdb.yaml` | PodDisruptionBudget — ensures minimum 1 pod is always available during node drains/upgrades |

**Init Container (all services):**  
Before the main service container starts, a `busybox:1.36` init container waits for the RDS database to be reachable on port 5432 using `nc -z`. This prevents crash loops on startup when the database is not yet ready.

**Security Context (all services):**
- `runAsNonRoot: true`
- `runAsUser: 1000`
- `allowPrivilegeEscalation: false`
- `fsGroup: 1000`

**Resource Limits (typical):**
- CPU: `100m` request / `500m` limit
- Memory: `128Mi` request / `512Mi` limit

**Topology Spread Constraints:**  
All services use `topologySpreadConstraints` with `topologyKey: topology.kubernetes.io/zone` to distribute pods across multiple availability zones for high availability.

---

### 5.3 Networking — Gateway API & ALB Ingress

**Traffic Flow:**

```
Internet
    │
    ▼
AWS Application Load Balancer (internet-facing, HTTP→HTTPS redirect)
    │   - SSL termination (ACM certificate for caresync-project.online)
    │   - WAFv2 ACL attached (CareSync-prod-waf)
    │   - ExternalDNS manages Route53 A record
    │
    ▼
Kubernetes Ingress (ALB Controller)
    │   kind: Ingress (ingress-alb.yaml)
    │   - Forwards all traffic to the kgateway Service on port 80
    │
    ▼
kgateway (Gloo Gateway) — Gateway API
    │   kind: Gateway (gateway.yaml)
    │   - gatewayClassName: kgateway
    │   - HTTP on port 80
    │
    ▼
HTTPRoute (per service)
    │   - Routes by path prefix:
    │     /api/auth/*       → auth-service:3001
    │     /api/patients/*   → user-service:3002
    │     /api/doctors/*    → user-service:3002
    │     /api/admin/*      → user-service:3002
    │     /api/appointments/* → appointment-service:3003
    │     /api/records/*    → appointment-service:3003
    │     /api/documents/*  → document-service:3004
    │     /api/notifications/* → notification-service:3005
    │     /*                → frontend:80 (SPA catch-all)
    │
    ▼
ClusterIP Services → Pods
```

---

### 5.4 External Secrets

**Templates:** `helm/templates/external-secrets/`

Two resources are deployed:

1. **`ClusterSecretStore`** — A cluster-wide provider configuration that tells External Secrets Operator how to authenticate with AWS Secrets Manager (using the IRSA service account `external-secrets-sa`).

2. **`ExternalSecret`** — Declares that the Kubernetes Secret named `caresync-app-secrets` (referenced by all pods via `envFrom: secretRef`) should be populated from the AWS Secrets Manager secret `caresync/app-secrets-prod`. The secret is refreshed on a defined interval.

This ensures no secrets are ever stored in the GitOps repository or in container images.

---

### 5.5 Network Policies

**Templates:** `helm/templates/networkpolicies/`

Three network policies enforce pod-level traffic isolation:

| Policy | Effect |
|---|---|
| `default-deny.yaml` | Deny all ingress AND egress traffic to all pods in the namespace by default |
| `allow-dns.yaml` | Explicitly allow all pods to reach `kube-dns` on port 53 (UDP/TCP) — required for service discovery |
| `allow-egress.yaml` | Allow all pods to make outbound HTTPS (port 443) connections — required for AWS SDK calls (S3, SQS, Bedrock, Secrets Manager) |

Additional per-service HTTPRoute policies implicitly allow ingress from the Gateway. RDS connectivity relies on VPC-level security groups (pods can reach RDS because they are in the same VPC).

---

### 5.6 ArgoCD Application

**Manifest:** `gitops/apps/caresync-prod.yaml`

```yaml
kind: Application
metadata:
  name: caresync-prod
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/care-sync-org/caresync-gitops.git
    targetRevision: HEAD
    path: helm
    helm:
      valueFiles: [values.yaml, values-prod.yaml]
  destination:
    namespace: caresync-prod
  syncPolicy:
    automated:
      prune: true      # Delete resources removed from Helm
      selfHeal: true   # Revert any manual cluster changes
    syncOptions:
      - CreateNamespace=true
      - ServerSideApply=true
    retry:
      limit: 3
      backoff: { duration: 5s, maxDuration: 3m, factor: 2 }
```

ArgoCD is configured with **automated sync**, **self-healing**, and **pruning**. This means:
- Any change to `caresync-gitops/main` is automatically applied to the cluster
- Any manual change to the cluster is automatically reverted
- Resources removed from Helm are automatically deleted from the cluster

---

## 6. End-to-End CI/CD Flow

```
Developer pushes to 'main' in caresync-app
              │
              ▼
    ┌─────────────────────┐
    │   detect-changes    │ ← Determine which services changed
    │   Generate SHA tag  │   (always ALL on main push)
    │   Generate semver   │   prod-<sha>, v<X.Y.Z>
    └─────────┬───────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌─────────┐      ┌──────────┐
│SonarCloud│     │  Snyk    │   ← Security scans (parallel, non-blocking)
│  SAST   │      │  SCA     │
└─────────┘      └──────────┘
              │
              ▼
    ┌────────────────────┐
    │ build-scan-push    │ ← Docker build → Trivy scan → ECR push
    │ (per service,      │   (all 7 services in parallel)
    │  parallel)         │
    └─────────┬──────────┘
              │
              ▼ (only on main, only if all builds succeed)
    ┌────────────────────┐
    │  trigger-deploy    │ ← Dispatch deploy.yml
    └─────────┬──────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │   deploy.yml                │
    │   1. Send approval email    │
    │   2. Wait for GitHub        │ ← Manual approval gate
    │      environment approval   │   (GitHub "production" environment)
    │   3. Clone caresync-gitops  │
    │   4. Update values-prod.yaml│ ← yq sets .services.<svc>.tag = sha_tag
    │   5. git push to gitops/main│
    └─────────┬───────────────────┘
              │
              ▼
    ┌────────────────────┐
    │      ArgoCD        │ ← Detects commit to caresync-gitops/main
    │   Auto-Sync        │   Runs helm upgrade --install
    │   (within ~3 min)  │   Kubernetes rolling update per service
    └────────────────────┘
```

---

## 7. Security Architecture

| Layer | Control |
|---|---|
| **Network perimeter** | WAFv2 ACL attached to ALB (managed rule groups for OWASP Top 10) |
| **Transport** | TLS 1.2+ enforced via ACM certificate; HTTP→HTTPS redirect at ALB |
| **Authentication** | JWT Bearer tokens; short-lived access tokens + refresh token rotation |
| **Authorization** | RBAC enforced on every API endpoint via `requireRole()` middleware |
| **Rate limiting** | 100 requests/15 min per IP on auth endpoints |
| **Container security** | Non-root user (`UID 1000`), no privilege escalation, read-only root filesystem |
| **Network policies** | Default-deny all; explicit allow for DNS and HTTPS egress only |
| **Pod isolation** | Each service has a dedicated Kubernetes ServiceAccount with scoped IRSA IAM role |
| **Secrets management** | Zero secrets in code or Git; all secrets in AWS Secrets Manager, synced to K8s via External Secrets Operator |
| **Encryption at rest** | KMS customer-managed key encrypts RDS, S3, SQS, etcd, Secrets Manager |
| **Encryption in transit** | All inter-service communication within VPC is unencrypted (trusted network); external traffic is TLS |
| **Image security** | Trivy scans on every build; Snyk SCA on every build; ECR image scanning on push |
| **Infrastructure** | OIDC-based AWS authentication (no static IAM access keys); Terraform state encrypted in S3 |
| **Audit trail** | All significant API actions logged to `audit_logs` table with IP and user agent |

---

## 8. Environment Variables & Secrets

All application runtime configuration is delivered via AWS Secrets Manager (`caresync/app-secrets-prod`) and synced into Kubernetes by the External Secrets Operator as the `caresync-app-secrets` Kubernetes Secret. All pods mount this secret via `envFrom: secretRef`.

| Variable | Used By | Description |
|---|---|---|
| `DATABASE_URL` | All services | PostgreSQL connection string |
| `JWT_SECRET` | Auth service, Shared lib | JWT token signing/verification key |
| `S3_BUCKET_NAME` | Document service, AI service | Document storage bucket name |
| `SQS_QUEUE_URL` | AI service | ai-summary SQS queue URL |
| `FRONTEND_URL` | Auth service | Used in CORS and redirect configurations |
| `API_BASE_URL` | Frontend | Base URL for API calls |
| `SES_FROM_EMAIL` | Lambda reminder | Verified SES sender address |
| `NOTIFICATION_EMAIL` | Lambda reminder | Admin notification recipient |
| `AWS_REGION` | All services | Set to `us-east-1` |
| `BEDROCK_MODEL_ID` | AI service | `amazon.nova-lite-v1:0` (default if not set) |
| `QUEUE_PROVIDER` | AI service | `sqs` to enable SQS worker; unset for HTTP-only mode |

---

## 9. Tech Stack Summary

| Category | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Nginx |
| **Backend** | Node.js 22, TypeScript, Express.js |
| **Database** | PostgreSQL (AWS RDS), Prisma ORM |
| **Containerization** | Docker (Alpine base), AWS ECR |
| **Orchestration** | Kubernetes (AWS EKS), Helm |
| **Service Mesh / Gateway** | Kubernetes Gateway API + kgateway (Gloo v2) |
| **Ingress / Load Balancing** | AWS ALB + AWS Load Balancer Controller |
| **DNS** | AWS Route53 + ExternalDNS |
| **TLS** | AWS ACM |
| **Storage** | AWS S3 (documents), PostgreSQL RDS (structured data) |
| **Messaging** | AWS SQS (async AI jobs) |
| **AI / ML** | AWS Bedrock (Amazon Nova Lite model) |
| **Serverless** | AWS Lambda (appointment reminders) |
| **Email** | AWS SES |
| **Secrets** | AWS Secrets Manager + External Secrets Operator |
| **Encryption** | AWS KMS (customer-managed) |
| **Security** | AWS WAFv2, Helmet.js, bcryptjs, JWT, NetworkPolicy |
| **IaC** | Terraform (>= 1.5), AWS Provider v5 |
| **GitOps / CD** | ArgoCD (automated sync + self-heal) |
| **CI** | GitHub Actions (OIDC auth, parallel matrix builds) |
| **SAST** | SonarCloud |
| **SCA** | Snyk |
| **Container Scanning** | Aqua Trivy |
| **Observability** | AWS CloudWatch (Container Insights, Alarms, SNS) |
| **IAM** | IRSA (IAM Roles for Service Accounts) |
