# Security

Do not publish suspected vulnerabilities or credentials in a public issue.
Use GitHub private vulnerability reporting for this repository when available;
otherwise contact a maintainer privately through GitHub before disclosure.

Treat API responses, telemetry, URL state, and browser storage as untrusted.
The backend owns authorization and tenant isolation. A frontend visibility
check is not an authorization control. Never put long-lived secrets in the
browser bundle or mock credentials in production builds.
