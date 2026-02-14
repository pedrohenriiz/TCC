// components/PDFReport/components/InfoBox.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
}

export function PDFInfoBox({ title, children }: InfoBoxProps) {
  return (
    <View style={pdfStyles.infoBox}>
      <Text style={pdfStyles.infoBoxTitle}>{title}</Text>
      <Text style={pdfStyles.infoBoxText}>{children}</Text>
    </View>
  );
}
