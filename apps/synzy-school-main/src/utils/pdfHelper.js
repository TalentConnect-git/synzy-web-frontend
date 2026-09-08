// src/utils/pdfHelper.js
export const fetchPdfBlob = async (url) => {
  const token = localStorage.getItem("authToken"); // matches what AuthContext stores

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch PDF (${res.status}): ${text}`);
  }

  return await res.blob();
};
