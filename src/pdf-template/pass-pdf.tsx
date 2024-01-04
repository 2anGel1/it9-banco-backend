import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image
} from "@react-pdf/renderer";
import { readFilePath } from "../utils/code-utils";


interface PDFProps {
    firstName?: string;
    lastName?: string;
    qrcodePath?: string;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#E4E4E4",
    },
    section: {
        margin: 10,
        padding: 10,
    },
    heading: {
        fontSize: 24,
        fontWeight: 600,
        color: "#131925",
        marginBottom: 8
    },
    statement: {
        fontSize: 20,
        color: "#131925",
        lineHeight: 1.4,
        marginBottom: 4,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#999999",
        margin: "24px 0 24px 0"
    },
    paragraph: {
        fontSize: 12,
        color: "#212935",
        lineHeight: 1.67,
    },
    columnParent: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    columnStart: {
        flex: 1,
    },
    columnEnd: {
        flex: 1,
        alignItems: "flex-end"
    },
    qrcode: {
        width: "80px",
        height: "80px"
    }
});

const PassPDF = ({ firstName, lastName, qrcodePath }: PDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <View style={styles.columnParent}>
                        <View style={styles.columnStart}>
                            <Text style={styles.paragraph}>{firstName} {lastName}</Text>
                            <Image src={qrcodePath} style={styles.qrcode} />
                        </View>
                        <View style={styles.columnEnd}>
                        </View>
                    </View>
                    <View style={styles.divider}></View>
                    <View>
                        <Text style={styles.paragraph}>
                            Ticket généré le {new Date().getDate()}/{new Date().getMonth() + 1}/{new Date().getFullYear()}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PassPDF;