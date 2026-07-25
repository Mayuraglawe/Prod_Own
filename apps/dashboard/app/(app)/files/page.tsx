import React from 'react';
import { SuperAdminFiles } from '../../../components/super-admin-files';

export const metadata = {
  title: 'System Documentation & Files Vault | LiteTrace',
  description: 'Central system file vault storing general files analysis, project audit, and microservices KT guide.',
};

export default function GeneralFilesPage() {
  return <SuperAdminFiles />;
}
