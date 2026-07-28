-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateEnum
CREATE TYPE "app"."PlanTier" AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "app"."PlatformRole" AS ENUM ('ORG_OWNER', 'ORG_ADMIN', 'EXECUTIVE', 'PEOPLE_AND_CULTURE', 'HEALTH_AND_SAFETY', 'DEPARTMENT_MANAGER', 'LEADER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "app"."SeniorityLevel" AS ENUM ('EXECUTIVE', 'SENIOR_LEADER', 'MANAGER', 'TEAM_LEAD', 'INDIVIDUAL_CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "app"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CASUAL', 'FIXED_TERM', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "app"."PersonStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "app"."WellbeingDomain" AS ENUM ('WORK_DESIGN', 'CULTURE_AND_LEADERSHIP', 'SOCIAL_CONNECTIONS', 'MANA_WHENUA', 'DEI', 'PERSONAL_FACTORS', 'PSYCHOLOGICAL_SAFETY', 'PSYCHOSOCIAL_RISK', 'BURNOUT_BAT', 'WHO5', 'TE_WHARE_TAPA_WHA');

-- CreateEnum
CREATE TYPE "app"."BurnoutRiskBand" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "app"."SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "app"."QuestionType" AS ENUM ('LIKERT_5', 'LIKERT_7', 'YES_NO', 'FREE_TEXT', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "app"."RiskCategory" AS ENUM ('WORK_DEMANDS', 'ROLE_CLARITY', 'LEADERSHIP', 'RECOGNITION', 'WORK_RELATIONSHIPS', 'BULLYING', 'HARASSMENT', 'CHANGE_MANAGEMENT', 'JOB_CONTROL', 'SUPPORT', 'INCLUSION', 'PSYCHOLOGICAL_SAFETY', 'FATIGUE', 'BURNOUT', 'ISOLATION', 'ORGANISATIONAL_JUSTICE');

-- CreateEnum
CREATE TYPE "app"."RiskTrend" AS ENUM ('IMPROVING', 'STABLE', 'WORSENING');

-- CreateEnum
CREATE TYPE "app"."RiskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "app"."RiskStatus" AS ENUM ('IDENTIFIED', 'MONITORING', 'ACTION_PLANNED', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "app"."RiskStateType" AS ENUM ('INHERENT', 'CURRENT', 'RESIDUAL', 'TARGET');

-- CreateEnum
CREATE TYPE "app"."RiskEvidenceType" AS ENUM ('SURVEY_RESULT', 'CHECK_IN_TREND', 'SPEAK_UP_TREND', 'ACTION_COMPLETED', 'WORKSHOP_ATTENDANCE', 'MANUAL_ASSESSMENT');

-- CreateEnum
CREATE TYPE "app"."ControlEffectiveness" AS ENUM ('NOT_YET_ASSESSED', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "app"."ControlStatus" AS ENUM ('PLANNED', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "app"."ActionPlanStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "app"."RecommendationType" AS ENUM ('LEADERSHIP_ACTION', 'POLICY', 'COMMUNICATION', 'MANAGER_COACHING', 'TEAM_INTERVENTION', 'WORK_REDESIGN', 'ROLE_CLARIFICATION', 'RECOGNITION', 'FLEXIBLE_WORK', 'PROCESS_IMPROVEMENT', 'PSYCH_SAFETY_INITIATIVE', 'WORKSHOP', 'LEARNING_RESOURCE');

-- CreateEnum
CREATE TYPE "app"."EffortLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "app"."RecommendationStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "app"."LearningResourceType" AS ENUM ('ARTICLE', 'RESEARCH_SUMMARY', 'VIDEO', 'GUIDE', 'TEMPLATE', 'TOOLKIT', 'WORKSHOP');

-- CreateEnum
CREATE TYPE "app"."SpeakUpCategory" AS ENUM ('BULLYING', 'HARASSMENT', 'UNSAFE_BEHAVIOUR', 'PSYCHOLOGICAL_SAFETY', 'WORKPLACE_ISSUE', 'ETHICAL_CONCERN', 'GENERAL_WELLBEING');

-- CreateEnum
CREATE TYPE "app"."SpeakUpStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "app"."ChallengeType" AS ENUM ('STEPS', 'HYDRATION', 'MINDFULNESS', 'WALKING', 'GRATITUDE', 'LEARNING', 'CONNECTION', 'SLEEP', 'MOVEMENT', 'HEALTHY_HABITS');

-- CreateEnum
CREATE TYPE "app"."ReportType" AS ENUM ('EXECUTIVE_SUMMARY', 'ORGANISATION_HEALTH', 'PSYCHOSOCIAL_RISK', 'PSYCHOLOGICAL_SAFETY', 'BOARD_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "app"."ReportStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "app"."ActivityEventType" AS ENUM ('CHECKIN_SUBMITTED', 'PARTICIPATION_MILESTONE', 'RISK_EMERGING', 'RISK_IMPROVING', 'SPEAK_UP_SUBMITTED', 'BURNOUT_CHANGE', 'CHALLENGE_ACTIVITY', 'ORG_CHANGE');

-- CreateEnum
CREATE TYPE "app"."EventSeverity" AS ENUM ('INFO', 'POSITIVE', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "app"."AuditActorType" AS ENUM ('TENANT_USER', 'PLATFORM_STAFF', 'SYSTEM');

-- CreateEnum
CREATE TYPE "app"."ConnectorCategory" AS ENUM ('IDENTITY_SSO', 'CALENDAR_EMAIL', 'HRIS', 'PAYROLL', 'LMS', 'COLLABORATION', 'HEALTH_SAFETY', 'BUSINESS_INTELLIGENCE', 'PROJECT_MANAGEMENT', 'AI_PRODUCTIVITY', 'WORKFLOW_AUTOMATION');

-- CreateEnum
CREATE TYPE "app"."ConnectorProvider" AS ENUM ('MICROSOFT_365', 'GOOGLE_WORKSPACE', 'EMPLOYMENT_HERO', 'BAMBOOHR', 'HIBOB', 'WORKDAY', 'SAP_SUCCESSFACTORS', 'UKG', 'DAYFORCE', 'ADP', 'MOODLE', 'CORNERSTONE', 'DOCEBO', 'SLACK', 'MS_TEAMS', 'GOOGLE_CHAT', 'HEALTH_SAFETY_PLATFORM', 'POWER_BI', 'TABLEAU', 'LOOKER', 'MICROSOFT_PLANNER', 'JIRA', 'ASANA', 'MONDAY', 'TRELLO', 'MICROSOFT_COPILOT', 'CHATGPT_ENTERPRISE', 'CLAUDE_ENTERPRISE', 'GEMINI', 'POWER_AUTOMATE', 'ZAPIER', 'MAKE');

-- CreateEnum
CREATE TYPE "app"."ConnectorSyncMode" AS ENUM ('REALTIME', 'SCHEDULED', 'MANUAL');

-- CreateEnum
CREATE TYPE "app"."ConnectorStatus" AS ENUM ('NOT_CONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR', 'DISABLED');

-- CreateEnum
CREATE TYPE "app"."ConnectorSyncStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "app"."ConnectorSyncTrigger" AS ENUM ('REALTIME_EVENT', 'SCHEDULED', 'MANUAL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "platform"."PlatformStaffRole" AS ENUM ('SUPER_ADMIN', 'SUPPORT', 'SAFETY_OFFICER');

-- CreateEnum
CREATE TYPE "platform"."PlatformStaffStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "platform"."BreakGlassStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'DENIED', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "app"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT,
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Pacific/Auckland',
    "planTier" "app"."PlanTier" NOT NULL DEFAULT 'GROWTH',
    "ssoDomain" TEXT,
    "kAnonymityThreshold" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."divisions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."departments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "divisionId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."teams" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."locations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."workplace_groups" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workplace_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."people" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "app"."PlatformRole" NOT NULL DEFAULT 'EMPLOYEE',
    "roleType" TEXT,
    "seniority" "app"."SeniorityLevel",
    "employmentType" "app"."EmploymentType",
    "departmentId" TEXT,
    "locationId" TEXT,
    "workplaceGroupId" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "status" "app"."PersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "app"."check_ins" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "energyScore" INTEGER NOT NULL,
    "stressScore" INTEGER NOT NULL,
    "workloadScore" INTEGER,
    "reflection" TEXT,
    "domain" "app"."WellbeingDomain" NOT NULL DEFAULT 'PERSONAL_FACTORS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."who5_results" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "q1Cheerful" INTEGER NOT NULL,
    "q2Calm" INTEGER NOT NULL,
    "q3Active" INTEGER NOT NULL,
    "q4RestedFresh" INTEGER NOT NULL,
    "q5Interesting" INTEGER NOT NULL,
    "rawScore" INTEGER NOT NULL,
    "percentageScore" INTEGER NOT NULL,
    "belowThreshold" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "who5_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."bat_results" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exhaustionScore" DOUBLE PRECISION NOT NULL,
    "mentalDistanceScore" DOUBLE PRECISION NOT NULL,
    "cognitiveImpairmentScore" DOUBLE PRECISION NOT NULL,
    "emotionalImpairmentScore" DOUBLE PRECISION NOT NULL,
    "coreBurnoutScore" DOUBLE PRECISION NOT NULL,
    "secondaryScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "riskBand" "app"."BurnoutRiskBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bat_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."surveys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" "app"."WellbeingDomain" NOT NULL,
    "status" "app"."SurveyStatus" NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."survey_questions" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "app"."QuestionType" NOT NULL DEFAULT 'LIKERT_5',
    "domain" "app"."WellbeingDomain" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."survey_responses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "userId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."survey_answers" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "numericValue" INTEGER,
    "textValue" TEXT,

    CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."psychosocial_risks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "category" "app"."RiskCategory" NOT NULL,
    "domain" "app"."WellbeingDomain",
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "worksafeContext" TEXT,
    "contributingFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inherentScore" DOUBLE PRECISION,
    "currentScore" DOUBLE PRECISION NOT NULL,
    "residualScore" DOUBLE PRECISION,
    "targetScore" DOUBLE PRECISION,
    "trend" "app"."RiskTrend" NOT NULL DEFAULT 'STABLE',
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "priority" "app"."RiskPriority" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "status" "app"."RiskStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "ownerId" TEXT,
    "departmentScope" TEXT,
    "locationScope" TEXT,
    "evidenceSummary" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psychosocial_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."risk_history_points" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_history_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."risk_state_changes" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "stateType" "app"."RiskStateType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "evidenceType" "app"."RiskEvidenceType",
    "evidenceRef" TEXT,
    "recordedById" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_state_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."risk_controls" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectiveness" "app"."ControlEffectiveness" NOT NULL DEFAULT 'NOT_YET_ASSESSED',
    "status" "app"."ControlStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."action_plan_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "app"."RiskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "app"."ActionPlanStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "expectedOutcome" TEXT,
    "progressNotes" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewDate" TIMESTAMP(3),
    "residualRiskScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."recommendations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "riskId" TEXT,
    "type" "app"."RecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expectedImpact" TEXT,
    "effortLevel" "app"."EffortLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "app"."RecommendationStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."learning_resources" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "type" "app"."LearningResourceType" NOT NULL,
    "domain" "app"."WellbeingDomain" NOT NULL,
    "relatedRiskCategories" "app"."RiskCategory"[] DEFAULT ARRAY[]::"app"."RiskCategory"[],
    "summary" TEXT NOT NULL,
    "url" TEXT,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."speak_up_reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "category" "app"."SpeakUpCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "submittedById" TEXT,
    "departmentScope" TEXT,
    "locationScope" TEXT,
    "status" "app"."SpeakUpStatus" NOT NULL DEFAULT 'SUBMITTED',
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speak_up_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."speak_up_messages" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fromLeader" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speak_up_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."challenges" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "app"."ChallengeType" NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."challenge_participants" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "app"."ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "filters" JSONB,
    "status" "app"."ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "pdfUrl" TEXT,
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."activity_events" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "app"."ActivityEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "departmentScope" TEXT,
    "locationScope" TEXT,
    "severity" "app"."EventSeverity" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."notifications" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."audit_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorType" "app"."AuditActorType" NOT NULL DEFAULT 'TENANT_USER',
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."connector_installations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "app"."ConnectorProvider" NOT NULL,
    "category" "app"."ConnectorCategory" NOT NULL,
    "status" "app"."ConnectorStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "syncMode" "app"."ConnectorSyncMode" NOT NULL DEFAULT 'MANUAL',
    "encryptedCredentials" TEXT,
    "config" JSONB,
    "connectedById" TEXT,
    "connectedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" "app"."ConnectorSyncStatus",
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."connector_sync_runs" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "trigger" "app"."ConnectorSyncTrigger" NOT NULL,
    "status" "app"."ConnectorSyncStatus" NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "connector_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."connector_webhook_events" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "connector_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."api_keys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."identity_records" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "mfaSecret" TEXT,
    "hrisEmployeeId" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_staff_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "platform"."PlatformStaffRole" NOT NULL DEFAULT 'SUPPORT',
    "status" "platform"."PlatformStaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_staff_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."break_glass_unlocks" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "status" "platform"."BreakGlassStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "accessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "break_glass_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."_TeamMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "app"."organizations"("slug");

-- CreateIndex
CREATE INDEX "divisions_organizationId_idx" ON "app"."divisions"("organizationId");

-- CreateIndex
CREATE INDEX "departments_organizationId_idx" ON "app"."departments"("organizationId");

-- CreateIndex
CREATE INDEX "teams_organizationId_idx" ON "app"."teams"("organizationId");

-- CreateIndex
CREATE INDEX "locations_organizationId_idx" ON "app"."locations"("organizationId");

-- CreateIndex
CREATE INDEX "workplace_groups_organizationId_idx" ON "app"."workplace_groups"("organizationId");

-- CreateIndex
CREATE INDEX "people_organizationId_idx" ON "app"."people"("organizationId");

-- CreateIndex
CREATE INDEX "people_departmentId_idx" ON "app"."people"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "app"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "app"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "app"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "app"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "check_ins_organizationId_createdAt_idx" ON "app"."check_ins"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "check_ins_userId_createdAt_idx" ON "app"."check_ins"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "who5_results_organizationId_createdAt_idx" ON "app"."who5_results"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "who5_results_userId_createdAt_idx" ON "app"."who5_results"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "bat_results_organizationId_createdAt_idx" ON "app"."bat_results"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "bat_results_userId_createdAt_idx" ON "app"."bat_results"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "surveys_organizationId_idx" ON "app"."surveys"("organizationId");

-- CreateIndex
CREATE INDEX "survey_questions_surveyId_idx" ON "app"."survey_questions"("surveyId");

-- CreateIndex
CREATE INDEX "survey_responses_organizationId_idx" ON "app"."survey_responses"("organizationId");

-- CreateIndex
CREATE INDEX "survey_responses_surveyId_idx" ON "app"."survey_responses"("surveyId");

-- CreateIndex
CREATE INDEX "survey_answers_responseId_idx" ON "app"."survey_answers"("responseId");

-- CreateIndex
CREATE INDEX "psychosocial_risks_organizationId_status_idx" ON "app"."psychosocial_risks"("organizationId", "status");

-- CreateIndex
CREATE INDEX "psychosocial_risks_organizationId_priority_idx" ON "app"."psychosocial_risks"("organizationId", "priority");

-- CreateIndex
CREATE INDEX "risk_history_points_riskId_recordedAt_idx" ON "app"."risk_history_points"("riskId", "recordedAt");

-- CreateIndex
CREATE INDEX "risk_state_changes_riskId_stateType_recordedAt_idx" ON "app"."risk_state_changes"("riskId", "stateType", "recordedAt");

-- CreateIndex
CREATE INDEX "risk_controls_organizationId_idx" ON "app"."risk_controls"("organizationId");

-- CreateIndex
CREATE INDEX "risk_controls_riskId_idx" ON "app"."risk_controls"("riskId");

-- CreateIndex
CREATE INDEX "action_plan_items_organizationId_idx" ON "app"."action_plan_items"("organizationId");

-- CreateIndex
CREATE INDEX "action_plan_items_riskId_idx" ON "app"."action_plan_items"("riskId");

-- CreateIndex
CREATE INDEX "action_plan_items_status_dueDate_idx" ON "app"."action_plan_items"("status", "dueDate");

-- CreateIndex
CREATE INDEX "recommendations_organizationId_idx" ON "app"."recommendations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "speak_up_reports_trackingCode_key" ON "app"."speak_up_reports"("trackingCode");

-- CreateIndex
CREATE INDEX "speak_up_reports_organizationId_status_idx" ON "app"."speak_up_reports"("organizationId", "status");

-- CreateIndex
CREATE INDEX "speak_up_messages_reportId_idx" ON "app"."speak_up_messages"("reportId");

-- CreateIndex
CREATE INDEX "challenges_organizationId_idx" ON "app"."challenges"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_key" ON "app"."challenge_participants"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "reports_organizationId_idx" ON "app"."reports"("organizationId");

-- CreateIndex
CREATE INDEX "activity_events_organizationId_createdAt_idx" ON "app"."activity_events"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "app"."notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "app"."audit_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "connector_installations_organizationId_idx" ON "app"."connector_installations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "connector_installations_organizationId_provider_key" ON "app"."connector_installations"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "connector_sync_runs_installationId_startedAt_idx" ON "app"."connector_sync_runs"("installationId", "startedAt");

-- CreateIndex
CREATE INDEX "connector_webhook_events_installationId_receivedAt_idx" ON "app"."connector_webhook_events"("installationId", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashedKey_key" ON "app"."api_keys"("hashedKey");

-- CreateIndex
CREATE INDEX "api_keys_organizationId_idx" ON "app"."api_keys"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "identity_records_personId_key" ON "identity"."identity_records"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "identity_records_email_key" ON "identity"."identity_records"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_staff_accounts_email_key" ON "platform"."platform_staff_accounts"("email");

-- CreateIndex
CREATE INDEX "break_glass_unlocks_personId_idx" ON "platform"."break_glass_unlocks"("personId");

-- CreateIndex
CREATE INDEX "break_glass_unlocks_status_idx" ON "platform"."break_glass_unlocks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMembers_AB_unique" ON "app"."_TeamMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamMembers_B_index" ON "app"."_TeamMembers"("B");

-- AddForeignKey
ALTER TABLE "app"."divisions" ADD CONSTRAINT "divisions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."departments" ADD CONSTRAINT "departments_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "app"."divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."teams" ADD CONSTRAINT "teams_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."teams" ADD CONSTRAINT "teams_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "app"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."teams" ADD CONSTRAINT "teams_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."locations" ADD CONSTRAINT "locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."workplace_groups" ADD CONSTRAINT "workplace_groups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."people" ADD CONSTRAINT "people_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."people" ADD CONSTRAINT "people_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "app"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."people" ADD CONSTRAINT "people_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "app"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."people" ADD CONSTRAINT "people_workplaceGroupId_fkey" FOREIGN KEY ("workplaceGroupId") REFERENCES "app"."workplace_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."check_ins" ADD CONSTRAINT "check_ins_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."check_ins" ADD CONSTRAINT "check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."who5_results" ADD CONSTRAINT "who5_results_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."who5_results" ADD CONSTRAINT "who5_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."bat_results" ADD CONSTRAINT "bat_results_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."bat_results" ADD CONSTRAINT "bat_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."surveys" ADD CONSTRAINT "surveys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_questions" ADD CONSTRAINT "survey_questions_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "app"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_responses" ADD CONSTRAINT "survey_responses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_responses" ADD CONSTRAINT "survey_responses_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "app"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_responses" ADD CONSTRAINT "survey_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_answers" ADD CONSTRAINT "survey_answers_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "app"."survey_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."survey_answers" ADD CONSTRAINT "survey_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "app"."survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."psychosocial_risks" ADD CONSTRAINT "psychosocial_risks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."psychosocial_risks" ADD CONSTRAINT "psychosocial_risks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."risk_history_points" ADD CONSTRAINT "risk_history_points_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "app"."psychosocial_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."risk_state_changes" ADD CONSTRAINT "risk_state_changes_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "app"."psychosocial_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."risk_controls" ADD CONSTRAINT "risk_controls_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."risk_controls" ADD CONSTRAINT "risk_controls_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "app"."psychosocial_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."action_plan_items" ADD CONSTRAINT "action_plan_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."action_plan_items" ADD CONSTRAINT "action_plan_items_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "app"."psychosocial_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."action_plan_items" ADD CONSTRAINT "action_plan_items_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "app"."recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."action_plan_items" ADD CONSTRAINT "action_plan_items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."recommendations" ADD CONSTRAINT "recommendations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."recommendations" ADD CONSTRAINT "recommendations_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "app"."psychosocial_risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."learning_resources" ADD CONSTRAINT "learning_resources_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."speak_up_reports" ADD CONSTRAINT "speak_up_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."speak_up_reports" ADD CONSTRAINT "speak_up_reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."speak_up_messages" ADD CONSTRAINT "speak_up_messages_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "app"."speak_up_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."challenges" ADD CONSTRAINT "challenges_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."challenge_participants" ADD CONSTRAINT "challenge_participants_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "app"."challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."challenge_participants" ADD CONSTRAINT "challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."reports" ADD CONSTRAINT "reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."activity_events" ADD CONSTRAINT "activity_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."connector_installations" ADD CONSTRAINT "connector_installations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."connector_sync_runs" ADD CONSTRAINT "connector_sync_runs_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "app"."connector_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."connector_webhook_events" ADD CONSTRAINT "connector_webhook_events_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "app"."connector_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."api_keys" ADD CONSTRAINT "api_keys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."break_glass_unlocks" ADD CONSTRAINT "break_glass_unlocks_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "platform"."platform_staff_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."break_glass_unlocks" ADD CONSTRAINT "break_glass_unlocks_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "platform"."platform_staff_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_TeamMembers" ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "app"."people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_TeamMembers" ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "app"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
