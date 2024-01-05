import React from "react";
import {
    StyleSheet,
    Document,
    Image,
    Text,
    Page,
    Font,
} from "@react-pdf/renderer";
import { readFilePath, writeFilePath } from "../config/index";

Font.register({
    family: 'Montserrat',
    fonts: [
      {
        src: writeFilePath + "/fonts/Montserrat-Bold.ttf",
      },
    ],
  });

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#E4E4E4",
    },
    pass: {
        width: "80%",
        marginLeft: 10,
        marginTop: 10
    },
    qrcode: {
        width: "110px",
        height: "110px",
        position: "absolute",
        top: 57,
        left: 24
    },
    lastname: {
        position: "absolute",
        top: 75,
        left: 162,

        fontFamily: 'Montserrat',
        color: "#ffffff",

        fontSize: 15
    },
    firstname: {
        position: "absolute",
        top: 95,
        left: 162,

        fontFamily: 'Montserrat',
        color: "#ffffff",

        fontSize: 15
    },
    classe: {
        position: "absolute",
        top: 140,
        left: 162,

        fontFamily: 'Montserrat',
        color: "#ffffff",

        fontSize: 15
    }
});

type userData = {
    firstName: string;
    lastName?: string;
    classe?: string;
}

interface PDFProps {
    user?: userData;
    qrcodePath?: string;
}

function PassCard({ user, qrcodePath }: PDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image
                    src={readFilePath + "/images/ticket.png"}
                    style={styles.pass}
                />

                <Text style={styles.lastname}>{user?.lastName?.toUpperCase()}</Text>
                <Text style={styles.firstname}>{user?.firstName?.toUpperCase()}</Text>
                <Text style={styles.classe}>{user?.classe}</Text>

                <Image
                    src={qrcodePath}
                    style={styles.qrcode}
                />
            </Page>
        </Document>
    );
}

export default PassCard;