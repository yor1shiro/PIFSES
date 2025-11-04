FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Create a mock API Gateway server
COPY main.go ./
RUN echo '#!/bin/sh' > api-gateway && chmod +x api-gateway

EXPOSE 8080

CMD ["sh", "-c", "echo 'API Gateway starting on :8080' && sleep infinity"]

CMD ["./api-gateway"]
