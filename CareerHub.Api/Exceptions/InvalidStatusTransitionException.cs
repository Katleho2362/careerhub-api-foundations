namespace CareerHub.Api.Exceptions;

public class InvalidStatusTransitionException(string from, string to)
    : Exception($"Cannot transition an application from '{from}' to '{to}'.");