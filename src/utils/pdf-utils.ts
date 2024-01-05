import { readFilePath, writeFilePath } from "../config/index";
import PassCard from "../pdf-template/pass-pdf";
import ReactPDF from "@react-pdf/renderer";
const qr = require("qrcode");
const fs = require('fs');



export const generatePDF = async (fileName?: string, user?: any, download?: boolean, qrcodePath?: string) => {
    const result = download ? await ReactPDF.renderToStream(PassCard({ user, qrcodePath })) : await ReactPDF.render(PassCard({ user, qrcodePath }), `${writeFilePath}/pdf/${fileName}`);
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

export const deleteFile = async (filepath: string) => {
    fs.unlink(filepath, function (err: any) {
        if (err && err.code == 'ENOENT') {
            console.info("File doesn't exist, won't remove it.");
        } else if (err) {
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`File deleted`);
        }
    });
}