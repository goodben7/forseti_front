import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import {
  PiHouseLineDuotone,
  PiUserCircleDuotone,
  PiEnvelopeDuotone,
  PiArrowsClockwiseDuotone,
  PiCalendarDuotone,
  PiBrainDuotone,
  PiNotebookDuotone,
  PiFolderDuotone,
  PiUsersThreeDuotone,
} from 'react-icons/pi';

export interface MenuItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  dropdownItems?: MenuItem[];
}

// Note: do not add href in the label object, it is rendering as label
export const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '#',
    icon: <PiHouseLineDuotone />,
    dropdownItems: [
      {
        name: "Vue d’ensemble",
        href: '#',
      },
      {
        name: 'Statistiques clés',
        href: '#',
      },
      {
        name: 'Alertes & priorités',
        href: '#',
      },
      {
        name: 'Audiences du jour / à venir',
        href: '#',
      },
    ],
  },
  {
    name: 'Demandeurs',
    href: '#',
    icon: <PiUserCircleDuotone />,
    dropdownItems: [
      {
        name: 'Liste des demandeurs',
        href: '#',
      },
      {
        name: 'Ajouter un demandeur',
        href: '#',
      },
      {
        name: 'Historique des audiences',
        href: '#',
      },
      {
        name: 'Profils sensibles / alertes',
        href: '#',
      },
    ],
  },
  {
    name: 'Demandes d’audience',
    href: '#',
    icon: <PiEnvelopeDuotone />,
    dropdownItems: [
      {
        name: 'Toutes les demandes',
        href: '#',
      },
      {
        name: 'Nouvelles demandes',
        href: '#',
      },
      {
        name: 'En cours de traitement',
        href: '#',
      },
      {
        name: 'Acceptées',
        href: '#',
      },
      {
        name: 'Refusées',
        href: '#',
      },
      {
        name: 'Archivées',
        href: '#',
      },
      {
        name: 'Demandes collectives',
        href: '#',
      },
    ],
  },
  {
    name: 'Workflow',
    href: '#',
    icon: <PiArrowsClockwiseDuotone />,
    dropdownItems: [
      {
        name: 'États du workflow',
        href: '#',
      },
      {
        name: 'Règles de validation',
        href: '#',
      },
      {
        name: 'Niveaux d’approbation',
        href: '#',
      },
      {
        name: 'Délais & SLA',
        href: '#',
      },
      {
        name: 'Priorisation automatique',
        href: '#',
      },
      {
        name: 'Assignation des conseillers',
        href: '#',
      },
    ],
  },
  {
    name: 'Audiences',
    href: '#',
    icon: <PiCalendarDuotone />,
    dropdownItems: [
      {
        name: 'Calendrier des audiences',
        href: '#',
      },
      {
        name: 'Audiences à venir',
        href: '#',
      },
      {
        name: 'Audiences passées',
        href: '#',
      },
      {
        name: 'Replanification',
        href: '#',
      },
      {
        name: 'Audiences en visio',
        href: '#',
      },
    ],
  },
  {
    name: 'Briefings',
    href: '#',
    icon: <PiBrainDuotone />,
    dropdownItems: [
      {
        name: 'Briefings à préparer',
        href: '#',
      },
      {
        name: 'Briefings validés',
        href: '#',
      },
      {
        name: 'Historique des versions',
        href: '#',
      },
      {
        name: 'Générer PDF',
        href: '#',
      },
    ],
  },
  {
    name: 'Rapports',
    href: '#',
    icon: <PiNotebookDuotone />,
    dropdownItems: [
      {
        name: 'Rapports à rédiger',
        href: '#',
      },
      {
        name: 'Rapports validés',
        href: '#',
      },
      {
        name: 'Suivi des engagements',
        href: '#',
      },
      {
        name: 'Générer actions',
        href: '#',
      },
    ],
  },
  {
    name: 'Documents',
    href: '#',
    icon: <PiFolderDuotone />,
    dropdownItems: [
      {
        name: 'Documents par demande',
        href: '#',
      },
      {
        name: 'Documents confidentiels',
        href: '#',
      },
      {
        name: 'Modèles & templates',
        href: '#',
      },
      {
        name: 'Archivage sécurisé',
        href: '#',
      },
    ],
  },
  {
    name: 'Utilisateurs & rôles',
    href: '#',
    icon: <PiUsersThreeDuotone />,
    dropdownItems: [
      {
        name: 'Liste des utilisateurs',
        href: routes.users.list,
      },
      {
        name: 'Rôles & permissions',
        href: '#',
      },
      {
        name: 'Participants aux audiences',
        href: '#',
      },
      {
        name: 'Accès & habilitations',
        href: '#',
      },
    ],
  },
];
