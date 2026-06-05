using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Repositories.Contract
{
    public interface IGenericRepository<T> where T : BaseEntity
    {

        Task<T?> GetByIdAsync(Guid id);
        IQueryable<T> GetAllAsync();
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        void Delete(T entity);
        IQueryable<T> GetQueryable();

    }
}
