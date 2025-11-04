FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Create a mock Forecasting Service
RUN echo '#!/bin/sh' > forecasting-service && chmod +x forecasting-service

EXPOSE 8081

CMD ["sh", "-c", "echo 'Forecasting Service starting on :8081' && sleep infinity"]
