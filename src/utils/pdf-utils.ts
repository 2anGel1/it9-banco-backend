import createPdf from "../pdf-template/pass-pdf"

export const generatePDF = async (data: any) => {
    const result = createPdf(data);
    return result;
}