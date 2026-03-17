import { analyzeWithNova } from "@/lib/nova";
import { sendApiDownAlert } from "@/lib/mailer";
import { POST } from "../route";

jest.mock("@/lib/nova");
jest.mock("@/lib/mailer");

const mockedAnalyze = analyzeWithNova as jest.MockedFunction<typeof analyzeWithNova>;
const mockedMailer = sendApiDownAlert as jest.MockedFunction<typeof sendApiDownAlert>;

const mockRequest = (body: object) =>
  ({ json: async () => body } as Request);

beforeEach(() => jest.clearAllMocks());

describe("POST /api/analyze — API down scenarios", () => {
  it("falls back and sends alert email when Nova returns HTTP 503", async () => {
    const error = new Error("Nova API error: 503 Service Unavailable");
    mockedAnalyze.mockRejectedValueOnce(error);
    mockedMailer.mockResolvedValueOnce(undefined);

    const res = await POST(mockRequest({ message: "I'm overwhelmed", context: "work" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).toHaveBeenCalledWith(error.message);
  });

  it("falls back and sends alert email when Nova returns HTTP 429", async () => {
    const error = new Error("Nova API error: 429 Too Many Requests");
    mockedAnalyze.mockRejectedValueOnce(error);
    mockedMailer.mockResolvedValueOnce(undefined);

    const res = await POST(mockRequest({ message: "I'm overwhelmed", context: "work" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).toHaveBeenCalledWith(error.message);
  });

  it("falls back and sends alert email when Nova returns HTTP 401", async () => {
    const error = new Error("Nova API error: 401 Unauthorized");
    mockedAnalyze.mockRejectedValueOnce(error);
    mockedMailer.mockResolvedValueOnce(undefined);

    const res = await POST(mockRequest({ message: "I'm overwhelmed", context: "work" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).toHaveBeenCalledWith(error.message);
  });

  it("falls back and sends alert email when Nova returns HTTP 400", async () => {
    const error = new Error("Nova API error: 400 Bad Request");
    mockedAnalyze.mockRejectedValueOnce(error);
    mockedMailer.mockResolvedValueOnce(undefined);

    const res = await POST(mockRequest({ message: "I'm overwhelmed", context: "work" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).toHaveBeenCalledWith(error.message);
  });

  it("falls back and sends alert email when Nova is unreachable (network error)", async () => {
    const error = new Error("fetch failed");
    mockedAnalyze.mockRejectedValueOnce(error);
    mockedMailer.mockResolvedValueOnce(undefined);

    const res = await POST(mockRequest({ message: "stressed about deadline", context: "school" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).toHaveBeenCalledWith(error.message);
  });

  it("falls back but does NOT send alert email when Nova returns invalid JSON (not an outage)", async () => {
    const error = new Error("Nova returned non-JSON response: <html>Bad Gateway</html>");
    mockedAnalyze.mockRejectedValueOnce(error);

    const res = await POST(mockRequest({ message: "can't handle this", context: "social" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.supportMessage).toContain("Fallback mode was used.");
    expect(mockedMailer).not.toHaveBeenCalled();
  });

  it("does NOT send alert email when Nova succeeds", async () => {
    mockedAnalyze.mockResolvedValueOnce({
      stressLevel: "Low",
      pressureType: "General Pressure",
      calmMode: false,
      rewrittenMessage: "I'm fine.",
      supportMessage: "All good.",
    });

    const res = await POST(mockRequest({ message: "doing well", context: "work" }));

    expect(res.status).toBe(200);
    expect(mockedMailer).not.toHaveBeenCalled();
  });
});
