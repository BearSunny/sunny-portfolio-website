import type { ComponentType } from 'react';
import { WorkWindow } from '@/components/windows/WorkWindow';
import type { WindowComponentProps } from '@/types/window';
import { ProjectsWindow } from '@/components/windows/ProjectsWindow';
import { AboutMeWindow } from '@/components/windows/AboutMeWindow';
import { MusicWindow } from '@/components/windows/MusicWindow';
import { ContactWindow } from '@/components/windows/ContactWindow';
import { WritingWindow } from '@/components/windows/WritingWindow';
import { GameWindow } from '@/components/windows/GamesWindow';

export interface AppDefinition {
  title: string;
  icon: string;
  component?: ComponentType<WindowComponentProps>;
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
  work: {
    title: 'Work',
    icon: '/icons/work.svg',
    component: WorkWindow,
  },
  projects: { title: 'Projects', icon: '/icons/projects.svg', component: ProjectsWindow },
  about: { title: 'About Me', icon: '/icons/user.svg' , component: AboutMeWindow },
  contact: { title: 'Contact', icon: '/icons/mail.svg', component: ContactWindow },
  drawing: { title: 'Fishu Fishi', icon: '/icons/drawing.png', component: GameWindow },
  music: { title: 'Music', icon: '/icons/music.svg', component: MusicWindow },
  writing: { title: 'Writing', icon: '/icons/blog.svg', component: WritingWindow },
};

export const DESKTOP_APPS = Object.entries(APP_REGISTRY).map(([id, app]) => ({
  id,
  label: app.title,
  icon: app.icon,
}));