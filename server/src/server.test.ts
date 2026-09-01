import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

// 1. Mocks dos módulos externos e rotas
const mockApp = {
  register: jest.fn().mockImplementation(() => Promise.resolve()),
  listen: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Declaração aceitando parâmetro para evitar o erro ts(2554)
const mockFastify = jest.fn((_opts?: unknown) => mockApp);

jest.unstable_mockModule("fastify", () => ({
  default: mockFastify,
}));

jest.unstable_mockModule("@fastify/cors", () => ({
  default: "cors-plugin-mock",
}));

jest.unstable_mockModule("./routes/index.js", () => ({
  default: "routes-plugin-mock",
}));

describe("Inicialização do Servidor", () => {
  const originalEnv = process.env;
  const mockExit = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve lançar erro se URL_DEVELOP não estiver definida nas variáveis de ambiente", async () => {
    delete process.env.URL_DEVELOP;
    process.env.PORT = "3333";

    await expect(import(`./server.js?test=${Math.random()}`)).rejects.toThrow(
      "Informe a url do frontend."
    );
  });

  it("deve lançar erro se PORT não estiver definida nas variáveis de ambiente", async () => {
    process.env.URL_DEVELOP = "http://localhost:3000";
    delete process.env.PORT;

    await expect(import(`./server.js?test=${Math.random()}`)).rejects.toThrow(
      "Informe uma porta."
    );
  });

  it("deve registrar o CORS, as rotas e escutar na porta correta com sucesso", async () => {
    process.env.URL_DEVELOP = "http://localhost:3000";
    process.env.PORT = "3333";

    await import(`./server.js?test=${Math.random()}`);

    expect(mockFastify).toHaveBeenCalledWith({ logger: false });

    expect(mockApp.register).toHaveBeenNthCalledWith(1, "cors-plugin-mock", {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    expect(mockApp.register).toHaveBeenNthCalledWith(2, "routes-plugin-mock");

    expect(mockApp.listen).toHaveBeenCalledWith({
      port: 3333,
      host: "0.0.0.0",
    });

    expect(mockConsoleLog).toHaveBeenCalledWith("Server is running on port 3333");
  });

  it("deve registrar o erro e encerrar o processo se falhar ao iniciar o servidor", async () => {
    process.env.URL_DEVELOP = "http://localhost:3000";
    process.env.PORT = "3333";

    const listenError = new Error("Falha ao abrir a porta");
    mockApp.listen.mockRejectedValueOnce(listenError as never);

    await import(`./server.js?test=${Math.random()}`);

    expect(mockConsoleError).toHaveBeenCalledWith(listenError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});