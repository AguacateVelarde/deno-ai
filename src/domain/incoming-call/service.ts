export const incomingCall = (request: Request) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Connect>
            <Stream url="wss://${
    request.headers.get("host")
  }/api/v1/incoming-websocket?companyId=123" />
        </Connect>
    </Response>`;
};
