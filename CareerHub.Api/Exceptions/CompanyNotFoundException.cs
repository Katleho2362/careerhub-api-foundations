namespace CareerHub.Api.Exceptions;

public class CompanyNotFoundException(Guid companyId)
    : Exception($"Company {companyId} does not exist.");