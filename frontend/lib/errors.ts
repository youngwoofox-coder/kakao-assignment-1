/** actions.ts에서 FastAPI 응답이 실패(!ok)일 때 던지는 에러 — 서버의 detail 메시지를 그대로 들고 다닌다 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
