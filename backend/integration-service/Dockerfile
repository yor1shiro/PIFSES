FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Create a mock Integration Service
RUN echo '#!/bin/sh' > integration-service && chmod +x integration-service

EXPOSE 8082

CMD ["sh", "-c", "echo 'Integration Service starting on :8082' && sleep infinity"]
