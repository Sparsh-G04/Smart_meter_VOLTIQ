export interface ExtractedData {
  discom: string | null;
  customerId: string | null;
}

export async function extractBillData(file: File): Promise<ExtractedData> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/extractBill', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to extract bill data');
  }

  return {
    discom: data.discom || null,
    customerId: data.customerId || null,
  };
}
