/** 서버 전용 — FastAPI URL (actions.ts) */
export function getBackendUrl(): string {
  const url = process.env.BACKEND_URL;

  if (!url) {
    throw new Error(
      "BACKEND_URL 환경변수가 설정되지 않았습니다. frontend/.env.local을 확인하세요.",
    );
  }

  return url;
}

/** 서버 전용 — FastAPI 인증 키. 절대 NEXT_PUBLIC_ 접두사를 붙이지 말 것 (브라우저 노출 시 무의미) */
export function getBackendApiKey(): string {
  const key = process.env.BACKEND_API_KEY;

  if (!key) {
    throw new Error(
      "BACKEND_API_KEY 환경변수가 설정되지 않았습니다. frontend/.env.local을 확인하세요.",
    );
  }

  return key;
}
