namespace backend.Repositories
{
    /// <summary>
    /// Unit of Work pattern interface for orchestrating database transactions across repositories.
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<T> Repository<T>() where T : class;
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}

