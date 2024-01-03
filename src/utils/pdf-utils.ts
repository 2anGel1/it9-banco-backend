import PassPDF from "../pdf-template/pass-pdf"
import ReactPDF from "@react-pdf/renderer";
const qr = require("qrcode");

export const generatePDF = async (fileName?: string, firstName?: string, lastName?: string, download?: boolean) => {
    const result = download ? await ReactPDF.renderToStream(PassPDF({ firstName, lastName })) : await ReactPDF.render(PassPDF({ firstName, lastName }), `${process.cwd()}/src/assets/pdf/${fileName}`);
    return result;
}

export const logoAttachment = {
    filename: "bancoLogo.png",
    path: process.cwd() + "/src/assets/images/bancoLogo.png",
    cid: "bancoLogo",
};

export const generateQRCODE = (data: string) => {

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

    qr.toFile(process.cwd() + "/src/assets/qrcodes/qrcode.png", data, options, (err: Error) => {
        if (err) throw err;
        console.log('QR code generated successfully!');
    });
}