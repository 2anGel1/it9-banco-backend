import PassPDF from "../pdf-template/pass-pdf"
import ReactPDF from "@react-pdf/renderer";
const qr = require("qrcode");
import { readFilePath, writeFilePath } from "../utils/code-utils";



export const generatePDF = async (fileName?: string, firstName?: string, lastName?: string, download?: boolean, qrcodePath?: string) => {
    const result = download ? await ReactPDF.renderToStream(PassPDF({ firstName, lastName, qrcodePath })) : await ReactPDF.render(PassPDF({ firstName, lastName, qrcodePath }), `${writeFilePath}/pdf/${fileName}`);
    return result;
}

export const logoAttachment = {
    filename: "bancoLogo.png",
    path: readFilePath + "/images/bancoLogo.png",
    cid: "bancoLogo",
};

export const generateQRCODE = async (data: string, qrcodePath: string) => {

    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.8,
        margin: 3,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    };
    await qr.toFile(qrcodePath, data, options, (err: Error) => {
        if (err) {
            console.log("ERREUR DE GENERATION DU QRCODE");
            throw err;
        }
        console.log('QR code generated successfully!');
    });
}