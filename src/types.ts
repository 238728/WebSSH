export interface SSHConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface TerminalTheme {
  name: string;
  isDark: boolean;
  background: string;
  foreground: string;
  cursor: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}

export interface TerminalSession {
  id: string;
  config: SSHConfig;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: string;
  theme?: TerminalTheme;
}

export interface AppConfig {
  groups: Group[];
  connections: SSHConfig[];
  selectedTheme: string;
  terminalFontSize: number;
  terminalFontFamily: string;
  cursorStyle: 'block' | 'underline' | 'bar';
  cursorBlink: boolean;
  scrollback?: number;
  sidebarWidth?: number;
  showHostInSidebar?: boolean;
  confirmOnClose?: boolean;
  confirmOnDeletion?: boolean;
  autoReconnect?: boolean;
  defaultUsername?: string;
  defaultPort?: number;
  themeMode?: 'light' | 'dark';
  showSftpPanel?: boolean;
  sftpDefaultPath?: string;
  sftpShowHiddenFiles?: boolean;
  language?: 'en' | 'zh';
}

export interface SftpFile {
  filename: string;
  longname: string;
  attrs: {
    mode: number;
    uid: number;
    gid: number;
    size: number;
    atime: number;
    mtime: number;
  };
}
