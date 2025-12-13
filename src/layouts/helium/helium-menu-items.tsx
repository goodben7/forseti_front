import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import {
  PiHouseLineDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'Overview',
  },
  // label end
  {
    name: 'Home',
    href: '/',
    icon: <PiHouseLineDuotone />,
  },
];
