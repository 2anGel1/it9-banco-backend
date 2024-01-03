import { Body, Container, Head, Hr, Html, Preview, Section, Text, Font } from "@react-email/components";
import * as React from "react";
import Logo from "./logo";
import { BaseMail, box, hr, paragraph, title, code } from "./base-mail";

interface PassMail {
  firstName: string;
  lastName: string;
  logoPath?: string;
}

export const PassMail = ({ firstName, lastName, logoPath }: PassMail) => (
  <BaseMail>
    <Section style={box}>
      <div>
        <img src={logoPath} width={80} height={80} alt={logoPath} />
      </div>
      <Hr style={hr} />
      <Text style={{ ...title, marginBottom: 20 }}>Salut <code style={code}>{lastName} {firstName}</code> ,</Text>

      <Text style={paragraph}>
        Merci pour votre participation à la sortie détente de la promotion IT9. <br />
        {logoPath}
        Vous trouverez en pièce jointe votre ticket d'entrée. <br /> <br />
        Rendez-vous le Samedi 20 Janvier 2024, pour un payia innoubliable !
      </Text>


      <Hr style={hr} />
    </Section>
  </BaseMail>
);

export default PassMail;
