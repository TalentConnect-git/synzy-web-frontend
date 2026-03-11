// src/utils/pdfHelper.js
export const fetchPdfBlob = async (url) => {
  const token = localStorage.getItem("token"); // adjust key if needed

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch PDF");
  }

  return await res.blob();
};
