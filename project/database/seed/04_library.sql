-- File: 04_library.sql
-- Mô tả: Seed dữ liệu thư viện tài nguyên
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Java Core Notes: Variables and Data Types', 'Nguyen Hai Dang', 'PDF', 'https://learnhub.example.com/java/java-core-notes-variables-and-data-types'),
    ('Java OOP Handbook: Classes and Objects', 'Tran Thu Phuong', 'PDF', 'https://learnhub.example.com/java/java-oop-handbook-classes-and-objects'),
    ('Java Inheritance Cheat Sheet', 'Le Quoc Hung', 'PDF', 'https://learnhub.example.com/java/java-inheritance-cheat-sheet'),
    ('Java Polymorphism Practice Guide', 'Pham Thanh Mai', 'PDF', 'https://learnhub.example.com/java/java-polymorphism-practice-guide'),
    ('Java Exception Handling Workbook', 'Jennifer Collins', 'PDF', 'https://learnhub.example.com/java/java-exception-handling-workbook'),
    ('Java Collections Quick Reference', 'Michael Chen', 'PDF', 'https://learnhub.example.com/java/java-collections-quick-reference'),
    ('Java Streams Explained', 'Vo Duc Long', 'PDF', 'https://learnhub.example.com/java/java-streams-explained'),
    ('Java Multithreading Basics', 'Dang Minh Quan', 'PDF', 'https://learnhub.example.com/java/java-multithreading-basics'),
    ('Java Unit Testing with JUnit', 'Sarah Nguyen', 'PDF', 'https://learnhub.example.com/java/java-unit-testing-with-junit'),
    ('Java Design Patterns Overview', 'David Walker', 'PDF', 'https://learnhub.example.com/java/java-design-patterns-overview');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Java Debugging Checklist', 'Hoang Nhat Quang', 'PDF', 'https://learnhub.example.com/java/java-debugging-checklist'),
    ('Java File I/O Reference', 'Emma Brooks', 'PDF', 'https://learnhub.example.com/java/java-file-i-o-reference'),
    ('Java Generics in Practice', 'Rachel Kim', 'PDF', 'https://learnhub.example.com/java/java-generics-in-practice'),
    ('Java Memory Model Summary', 'Anh Le', 'PDF', 'https://learnhub.example.com/java/java-memory-model-summary'),
    ('Java Spring Boot Starter Notes', 'Bao Tran', 'PDF', 'https://learnhub.example.com/java/java-spring-boot-starter-notes'),
    ('Java Collections Live Coding', 'Nguyen Hai Dang', 'VIDEO', 'https://learnhub.example.com/java/java-collections-live-coding'),
    ('Java Streams and Lambdas Walkthrough', 'Tran Thu Phuong', 'VIDEO', 'https://learnhub.example.com/java/java-streams-and-lambdas-walkthrough'),
    ('Java Concurrency Demo Session', 'Le Quoc Hung', 'VIDEO', 'https://learnhub.example.com/java/java-concurrency-demo-session'),
    ('Spring Boot REST API Build Along', 'Pham Thanh Mai', 'VIDEO', 'https://learnhub.example.com/java/spring-boot-rest-api-build-along'),
    ('Mockito Basics for Service Testing', 'Jennifer Collins', 'VIDEO', 'https://learnhub.example.com/java/mockito-basics-for-service-testing');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Java Profiling with VisualVM', 'Michael Chen', 'VIDEO', 'https://learnhub.example.com/java/java-profiling-with-visualvm'),
    ('Building a Layered Java Backend', 'Vo Duc Long', 'VIDEO', 'https://learnhub.example.com/java/building-a-layered-java-backend'),
    ('Refactoring Java Service Classes', 'Dang Minh Quan', 'VIDEO', 'https://learnhub.example.com/java/refactoring-java-service-classes'),
    ('Java Interview Practice: OOP Cases', 'Sarah Nguyen', 'VIDEO', 'https://learnhub.example.com/java/java-interview-practice-oop-cases'),
    ('Java Exception Handling Lab', 'David Walker', 'VIDEO', 'https://learnhub.example.com/java/java-exception-handling-lab'),
    ('SQL Foundations: SELECT and WHERE', 'Hoang Nhat Quang', 'PDF', 'https://learnhub.example.com/sql/sql-foundations-select-and-where'),
    ('SQL Joins Practice Pack', 'Emma Brooks', 'PDF', 'https://learnhub.example.com/sql/sql-joins-practice-pack'),
    ('SQL Aggregation and Reporting Notes', 'Rachel Kim', 'PDF', 'https://learnhub.example.com/sql/sql-aggregation-and-reporting-notes'),
    ('SQL Subquery Guide', 'Anh Le', 'PDF', 'https://learnhub.example.com/sql/sql-subquery-guide'),
    ('SQL Transaction Isolation Summary', 'Bao Tran', 'PDF', 'https://learnhub.example.com/sql/sql-transaction-isolation-summary');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('SQL Indexing Fundamentals', 'Nguyen Hai Dang', 'PDF', 'https://learnhub.example.com/sql/sql-indexing-fundamentals'),
    ('SQL Window Functions Workbook', 'Tran Thu Phuong', 'PDF', 'https://learnhub.example.com/sql/sql-window-functions-workbook'),
    ('SQL Query Optimization Checklist', 'Le Quoc Hung', 'PDF', 'https://learnhub.example.com/sql/sql-query-optimization-checklist'),
    ('SQL Schema Design and Normalization', 'Pham Thanh Mai', 'PDF', 'https://learnhub.example.com/sql/sql-schema-design-and-normalization'),
    ('SQL Backup and Restore Guide', 'Jennifer Collins', 'PDF', 'https://learnhub.example.com/sql/sql-backup-and-restore-guide'),
    ('SQL Stored Routine Review', 'Michael Chen', 'PDF', 'https://learnhub.example.com/sql/sql-stored-routine-review'),
    ('Advanced SQL for Analytics', 'Vo Duc Long', 'PDF', 'https://learnhub.example.com/sql/advanced-sql-for-analytics'),
    ('Lab Sheet: SQL Join Exercises', 'Dang Minh Quan', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-sql-join-exercises'),
    ('Lab Sheet: Aggregation Challenges', 'Sarah Nguyen', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-aggregation-challenges'),
    ('Lab Sheet: Transaction Scenarios', 'David Walker', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-transaction-scenarios');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Lab Sheet: Index Tuning Tasks', 'Hoang Nhat Quang', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-index-tuning-tasks'),
    ('Lab Sheet: Window Function Drills', 'Emma Brooks', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-window-function-drills'),
    ('Lab Sheet: Subquery Refactoring', 'Rachel Kim', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-subquery-refactoring'),
    ('Lab Sheet: Reporting Query Review', 'Anh Le', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-reporting-query-review'),
    ('Lab Sheet: Database Migration Steps', 'Bao Tran', 'DOC', 'https://learnhub.example.com/sql/lab-sheet-database-migration-steps'),
    ('System Design Primer for Students', 'Nguyen Hai Dang', 'PDF', 'https://learnhub.example.com/system-design/system-design-primer-for-students'),
    ('Scalability and Availability Notes', 'Tran Thu Phuong', 'PDF', 'https://learnhub.example.com/system-design/scalability-and-availability-notes'),
    ('Caching Strategy Comparison', 'Le Quoc Hung', 'PDF', 'https://learnhub.example.com/system-design/caching-strategy-comparison'),
    ('Database Sharding Concepts', 'Pham Thanh Mai', 'PDF', 'https://learnhub.example.com/system-design/database-sharding-concepts'),
    ('Rate Limiting Design Guide', 'Jennifer Collins', 'PDF', 'https://learnhub.example.com/system-design/rate-limiting-design-guide');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Message Queue Architecture Notes', 'Michael Chen', 'PDF', 'https://learnhub.example.com/system-design/message-queue-architecture-notes'),
    ('Notification Service Design Review', 'Vo Duc Long', 'PDF', 'https://learnhub.example.com/system-design/notification-service-design-review'),
    ('Chat System Architecture Overview', 'Dang Minh Quan', 'PDF', 'https://learnhub.example.com/system-design/chat-system-architecture-overview'),
    ('Load Balancer Fundamentals', 'Sarah Nguyen', 'PDF', 'https://learnhub.example.com/system-design/load-balancer-fundamentals'),
    ('Observability for Distributed Systems', 'David Walker', 'PDF', 'https://learnhub.example.com/system-design/observability-for-distributed-systems'),
    ('Designing a URL Shortener Whiteboard Session', 'Hoang Nhat Quang', 'VIDEO', 'https://learnhub.example.com/system-design/designing-a-url-shortener-whiteboard-session'),
    ('Designing a Chat Service Discussion', 'Emma Brooks', 'VIDEO', 'https://learnhub.example.com/system-design/designing-a-chat-service-discussion'),
    ('System Design Mock Interview: News Feed', 'Rachel Kim', 'VIDEO', 'https://learnhub.example.com/system-design/system-design-mock-interview-news-feed'),
    ('Scaling Read Heavy APIs', 'Anh Le', 'VIDEO', 'https://learnhub.example.com/system-design/scaling-read-heavy-apis'),
    ('Caching and Consistency Tradeoffs', 'Bao Tran', 'VIDEO', 'https://learnhub.example.com/system-design/caching-and-consistency-tradeoffs');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Queue Based Processing Demo', 'Nguyen Hai Dang', 'VIDEO', 'https://learnhub.example.com/system-design/queue-based-processing-demo'),
    ('Architecture Review: Notification Pipeline', 'Tran Thu Phuong', 'VIDEO', 'https://learnhub.example.com/system-design/architecture-review-notification-pipeline'),
    ('Database Partitioning Explained', 'Le Quoc Hung', 'VIDEO', 'https://learnhub.example.com/system-design/database-partitioning-explained'),
    ('REST API Design Checklist', 'Pham Thanh Mai', 'PDF', 'https://learnhub.example.com/rest-api/rest-api-design-checklist'),
    ('HTTP Status Code Quick Guide', 'Jennifer Collins', 'PDF', 'https://learnhub.example.com/rest-api/http-status-code-quick-guide'),
    ('JWT Authentication Notes', 'Michael Chen', 'PDF', 'https://learnhub.example.com/rest-api/jwt-authentication-notes'),
    ('API Versioning Patterns', 'Vo Duc Long', 'PDF', 'https://learnhub.example.com/rest-api/api-versioning-patterns'),
    ('Pagination and Filtering Guide', 'Dang Minh Quan', 'PDF', 'https://learnhub.example.com/rest-api/pagination-and-filtering-guide'),
    ('Input Validation Best Practices', 'Sarah Nguyen', 'PDF', 'https://learnhub.example.com/rest-api/input-validation-best-practices'),
    ('Error Handling for Public APIs', 'David Walker', 'PDF', 'https://learnhub.example.com/rest-api/error-handling-for-public-apis');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('OpenAPI Documentation Template', 'Hoang Nhat Quang', 'PDF', 'https://learnhub.example.com/rest-api/openapi-documentation-template'),
    ('REST Idempotency Examples', 'Emma Brooks', 'PDF', 'https://learnhub.example.com/rest-api/rest-idempotency-examples'),
    ('Secure Multi-Role API Design', 'Rachel Kim', 'PDF', 'https://learnhub.example.com/rest-api/secure-multi-role-api-design'),
    ('API Contract Review Worksheet', 'Anh Le', 'DOC', 'https://learnhub.example.com/rest-api/api-contract-review-worksheet'),
    ('Postman Collection Setup Notes', 'Bao Tran', 'DOC', 'https://learnhub.example.com/rest-api/postman-collection-setup-notes'),
    ('Swagger Annotation Examples', 'Nguyen Hai Dang', 'DOC', 'https://learnhub.example.com/rest-api/swagger-annotation-examples'),
    ('Request Validation Scenarios', 'Tran Thu Phuong', 'DOC', 'https://learnhub.example.com/rest-api/request-validation-scenarios'),
    ('API Logging Checklist', 'Le Quoc Hung', 'DOC', 'https://learnhub.example.com/rest-api/api-logging-checklist'),
    ('Role-Based Access Matrix Template', 'Pham Thanh Mai', 'DOC', 'https://learnhub.example.com/rest-api/role-based-access-matrix-template'),
    ('Git Workflow for Feature Branches', 'Jennifer Collins', 'PDF', 'https://learnhub.example.com/backend-tools/git-workflow-for-feature-branches');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Docker Basics for Backend Developers', 'Michael Chen', 'PDF', 'https://learnhub.example.com/backend-tools/docker-basics-for-backend-developers'),
    ('CI Pipeline Checklist for APIs', 'Vo Duc Long', 'PDF', 'https://learnhub.example.com/backend-tools/ci-pipeline-checklist-for-apis'),
    ('Code Review Guide for Service Teams', 'Dang Minh Quan', 'PDF', 'https://learnhub.example.com/backend-tools/code-review-guide-for-service-teams'),
    ('Testing Pyramid Summary', 'Sarah Nguyen', 'PDF', 'https://learnhub.example.com/backend-tools/testing-pyramid-summary'),
    ('Logging and Monitoring Basics', 'David Walker', 'PDF', 'https://learnhub.example.com/backend-tools/logging-and-monitoring-basics'),
    ('Redis Caching Notes', 'Hoang Nhat Quang', 'PDF', 'https://learnhub.example.com/backend-tools/redis-caching-notes'),
    ('Message Broker Comparison for Students', 'Emma Brooks', 'PDF', 'https://learnhub.example.com/backend-tools/message-broker-comparison-for-students'),
    ('Spring Boot Configuration Guide', 'Rachel Kim', 'PDF', 'https://learnhub.example.com/backend-tools/spring-boot-configuration-guide'),
    ('Backend Troubleshooting Handbook', 'Anh Le', 'PDF', 'https://learnhub.example.com/backend-tools/backend-troubleshooting-handbook'),
    ('Docker Compose Setup Walkthrough', 'Bao Tran', 'VIDEO', 'https://learnhub.example.com/backend-tools/docker-compose-setup-walkthrough');

INSERT IGNORE INTO resource (title, author, `type`, url) VALUES
    ('Git Rebase and Conflict Resolution Demo', 'Nguyen Hai Dang', 'VIDEO', 'https://learnhub.example.com/backend-tools/git-rebase-and-conflict-resolution-demo'),
    ('Running Integration Tests Locally', 'Tran Thu Phuong', 'VIDEO', 'https://learnhub.example.com/backend-tools/running-integration-tests-locally'),
    ('Observability Dashboard Tour', 'Le Quoc Hung', 'VIDEO', 'https://learnhub.example.com/backend-tools/observability-dashboard-tour'),
    ('Spring Boot Project Bootstrapping', 'Pham Thanh Mai', 'VIDEO', 'https://learnhub.example.com/backend-tools/spring-boot-project-bootstrapping'),
    ('Backend Debugging Session', 'Jennifer Collins', 'VIDEO', 'https://learnhub.example.com/backend-tools/backend-debugging-session'),
    ('Introduction to Redis Caching', 'Michael Chen', 'VIDEO', 'https://learnhub.example.com/backend-tools/introduction-to-redis-caching'),
    ('Kafka Concepts for Beginners', 'Vo Duc Long', 'VIDEO', 'https://learnhub.example.com/backend-tools/kafka-concepts-for-beginners'),
    ('Service Deployment Checklist Review', 'Dang Minh Quan', 'VIDEO', 'https://learnhub.example.com/backend-tools/service-deployment-checklist-review'),
    ('Reading API Logs Effectively', 'Sarah Nguyen', 'VIDEO', 'https://learnhub.example.com/backend-tools/reading-api-logs-effectively'),
    ('Code Review Simulation for Junior Developers', 'David Walker', 'VIDEO', 'https://learnhub.example.com/backend-tools/code-review-simulation-for-junior-developers');

SELECT COUNT(*) AS resource_seeded FROM resource;
