var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.FinancePlanner_API>("financeplannerapi")
    .WithExternalHttpEndpoints();

builder.AddNpmApp("financeplannerweb", "../../React", "dev")
    .WithReference(api)
    .WithEnvironment("BROWSER", "none")
    .WithHttpEndpoint(port: 80, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
