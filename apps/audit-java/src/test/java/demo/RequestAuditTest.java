package demo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class RequestAuditTest {
    @Test
    void describesRequest() {
        assertEquals("GET /health ua=curl/8.0", RequestAudit.describe("GET", "/health", "curl/8.0"));
    }

    @Test
    void auditDoesNotThrowOnBenignInput() {
        RequestAudit.auditRequest("GET", "/health", "curl/8.0");
        RequestAudit.auditStartup("1.0.0");
    }
}
