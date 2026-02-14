// components/PDFReport/styles.ts

import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  // Page
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    borderBottom: '3px solid #2563eb',
    paddingBottom: 30,
    marginBottom: 40,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },

  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },

  reportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Metadata
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },

  metadataItem: {
    width: '45%',
  },

  metadataLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  metadataValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
  },

  // Status Badge
  statusBadge: {
    display: 'flex',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  statusSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },

  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },

  statusError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },

  // Section
  section: {
    marginBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2px solid #e5e7eb',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },

  statCardTotal: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },

  statCardSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },

  statCardError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },

  statCardRate: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },

  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  statValueTotal: {
    color: '#374151',
  },

  statValueSuccess: {
    color: '#065f46',
  },

  statValueError: {
    color: '#991b1b',
  },

  statValueRate: {
    color: '#1e40af',
  },

  // Table
  table: {
    width: '100%',
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottom: '2px solid #e5e7eb',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottom: '1px solid #e5e7eb',
  },

  tableCell: {
    fontSize: 12,
    color: '#374151',
  },

  tableCellHeader: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },

  // Error
  errorItem: {
    padding: 20,
    marginBottom: 15,
    borderLeft: '4px solid #ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },

  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  errorType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  errorLocation: {
    fontSize: 10,
    color: '#6b7280',
  },

  errorMessage: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  errorDetails: {
    fontSize: 11,
    color: '#7f1d1d',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },

  errorValue: {
    fontFamily: 'Courier',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: '#dc2626',
    border: '1px solid #fca5a5',
  },

  // Info Box
  infoBox: {
    padding: 15,
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
    borderRadius: 6,
    marginBottom: 20,
  },

  infoBoxTitle: {
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
    fontSize: 12,
  },

  infoBoxText: {
    fontSize: 11,
    color: '#1e3a8a',
  },

  // Footer
  footer: {
    marginTop: 60,
    paddingTop: 20,
    borderTop: '2px solid #e5e7eb',
    alignItems: 'center',
  },

  footerText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },

  footerTextSmall: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 10,
  },
});
