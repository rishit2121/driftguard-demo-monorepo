package demo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Scenario E: audit logging of request metadata. The User-Agent header is attacker-controlled,
 * so with an affected log4j-core this is a CANDIDATE use site for CVE-2021-44228. Whether it is
 * exploitable depends on runtime configuration (lookups, JDK, egress) that static analysis cannot prove.
 */
public final class RequestAudit {
    private static final Logger LOG = LogManager.getLogger(RequestAudit.class);

    private RequestAudit() {}

    public static String describe(String method, String path, String userAgent) {
        return method + " " + path + " ua=" + userAgent;
    }

    public static void auditRequest(String method, String path, String userAgent) {
        LOG.info("request {}", describe(method, path, userAgent));
    }

    public static void auditStartup(String version) {
        // Constant, trusted message: not a candidate.
        LOG.info("audit service started");
    }
}
