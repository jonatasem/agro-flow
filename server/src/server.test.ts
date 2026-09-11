import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

// ============================================================================
// CONFIGURAÇÃO DE MOCKS (ESM)
// ============================================================================

// Cria uma instância simulada do servidor Fastify com os métodos encadeáveis/assíncronos
const mockApp = {
  register: jest.fn().mockImplementation(() => Promise.resolve()),
  listen: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Instancia a função construtora do Fastify.
// O parâmetro `_opts` é tipado opcionalmente para evitar erros de compilação do TypeScript [ts(2554)]
const mockFastify = jest.fn((_opts?: unknown) => mockApp);

// Mocks de módulos via ECMAScript Modules (ESM) no Jest.
// Substitui os módulos reais pelas versões simuladas antes do carregamento do arquivo principal.
jest.unstable_mockModule("fastify", () => ({
  default: mockFastify,
}));

jest.unstable_mockModule("@fastify/cors", () => ({
  default: "cors-plugin-mock",
}));

jest.unstable_mockModule("./routes/index.js", () => ({
  default: "routes-plugin-mock",
}));

// ============================================================================
// SUÍTE DE TESTES: INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

describe("Inicialização do Servidor", () => {
  // Guarda a referência original das variáveis de ambiente
  const originalEnv = process.env;

  // Intercepta chamadas do sistema (process.exit, console.log e console.error)
  // para evitar que o processo de teste feche ou polua o terminal com logs
  const mockExit = jest
    .spyOn(process, "exit")
    .mockImplementation((() => {}) as any);
  const mockConsoleLog = jest
    .spyOn(console, "log")
    .mockImplementation(() => {});
  const mockConsoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  // Executado antes de cada teste individual
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa histórico de chamadas de todos os mocks
    jest.resetModules();  // Limpa o cache de módulos para forçar o re-carregamento do server.js
    process.env = { ...originalEnv }; // Restaura as variáveis de ambiente originais
  });

  // Executado após cada teste individual
  afterEach(() => {
    process.env = originalEnv; // Garante a integridade do process.env global
  });

  // --------------------------------------------------------------------------
  // CASOS DE TESTE: VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
  // --------------------------------------------------------------------------

  it("deve lançar erro se URL_PROD não estiver definida nas variáveis de ambiente", async () => {
    delete process.env.URL_PROD;
    process.env.PORT = "3333";

    // O uso de query params com Math.random() força o Node/ESM a importar o arquivo como um novo módulo,
    // garantindo que o código de nível superior (top-level) do server.js seja executado novamente.
    await expect(import(`./server.js?test=${Math.random()}`)).rejects.toThrow(
      "Informe a url do frontend.",
    );
  });

  it("deve lançar erro se PORT não estiver definida nas variáveis de ambiente", async () => {
    process.env.URL_PROD = "http://localhost:3000";
    delete process.env.PORT;

    await expect(import(`./server.js?test=${Math.random()}`)).rejects.toThrow(
      "Informe uma porta.",
    );
  });

  // --------------------------------------------------------------------------
  // CASO DE TESTE: FLUXO DE SUCESSO (HAPPY PATH)
  // --------------------------------------------------------------------------

  it("deve registrar o CORS, as rotas e escutar na porta correta com sucesso", async () => {
    process.env.URL_PROD = "http://localhost:3000";
    process.env.PORT = "3333";

    // Executa o arquivo do servidor com variáveis de ambiente válidas
    await import(`./server.js?test=${Math.random()}`);

    // Valida se o Fastify foi instanciado sem o logger padrão ativo
    expect(mockFastify).toHaveBeenCalledWith({ logger: false });

    // Valida a 1ª chamada de registro: Configuração do plugin CORS
    expect(mockApp.register).toHaveBeenNthCalledWith(1, "cors-plugin-mock", {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Valida a 2ª chamada de registro: Registro do roteador da aplicação
    expect(mockApp.register).toHaveBeenNthCalledWith(2, "routes-plugin-mock");

    // Valida se o servidor subiu escutando na porta e host definidos
    expect(mockApp.listen).toHaveBeenCalledWith({
      port: 3333,
      host: "0.0.0.0",
    });

    // Valida se a mensagem de confirmação foi logada no console
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Server is running on port 3333",
    );
  });

  // --------------------------------------------------------------------------
  // CASO DE TESTE: TRATAMENTO DE ERROS NA INICIALIZAÇÃO
  // --------------------------------------------------------------------------

  it("deve registrar o erro e encerrar o processo se falhar ao iniciar o servidor", async () => {
    process.env.URL_PROD = "http://localhost:3000";
    process.env.PORT = "3333";

    // Simula uma falha assíncrona ao tentar abrir a porta (ex: porta ocupada)
    const listenError = new Error("Falha ao abrir a porta");
    mockApp.listen.mockRejectedValueOnce(listenError as never);

    await import(`./server.js?test=${Math.random()}`);

    // Verifica se o erro foi exibido no console.error e o processo foi encerrado com código 1 (erro)
    expect(mockConsoleError).toHaveBeenCalledWith(listenError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});