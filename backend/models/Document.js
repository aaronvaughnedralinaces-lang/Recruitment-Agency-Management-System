const db = require("../config/database");

const Document = {
  upsert: async (userId, companyId, docType, filePath) => {
    const query = `
            INSERT INTO company_documents (user_id, company_id, doc_type, file_path, status)
            VALUES (?, ?, ?, ?, 'pending')
            ON DUPLICATE KEY UPDATE
                file_path = VALUES(file_path),
                company_id = VALUES(company_id),
                status = 'pending',
                updated_at = CURRENT_TIMESTAMP
        `;
    await db.query(query, [userId, companyId, docType, filePath]);
  },

  findByCompanyId: async (companyId) => {
    const [rows] = await db.query(
      "SELECT id, doc_type, file_path, status, uploaded_at FROM company_documents WHERE company_id = ?",
      [companyId],
    );
    return rows;
  },
  getByCompanyId: async (companyId) => {
    const [rows] = await db.query(
      "SELECT id, doc_type, file_path, status, uploaded_at FROM company_documents WHERE company_id = ? ORDER BY uploaded_at DESC",
      [companyId],
    );
    return rows;
  },

  updateStatus: async (docId, status) => {
    await db.query("UPDATE company_documents SET status = ? WHERE id = ?", [
      status,
      docId,
    ]);
  },
};

module.exports = Document;
