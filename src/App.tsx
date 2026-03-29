import * as React from 'react';
import { useState, useEffect, useRef, Component, ReactNode, ErrorInfo } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import { io, Socket } from 'socket.io-client';
import { 
  Terminal as TerminalIcon, 
  Settings, 
  Plus, 
  Server, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Monitor, 
  Database, 
  Shield, 
  Key,
  Trash2,
  Play,
  Activity,
  Upload,
  Palette,
  FolderPlus,
  Edit2,
  Edit3,
  Check,
  GripVertical,
  Type,
  MousePointer2,
  RefreshCw,
  Layout,
  Eye,
  History,
  Lock,
  Sun,
  Moon,
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  Code,
  Download,
  ArrowLeft,
  Home,
  HardDrive,
  AlertCircle,
  Loader2,
  MoreVertical,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SSHConfig, TerminalSession, Group, TerminalTheme, AppConfig, SftpFile } from './types';

const THEMES: TerminalTheme[] = [
  {
    name: 'Tokyo Night',
    isDark: true,
    background: '#1a1b26',
    foreground: '#a9b1d6',
    cursor: '#f7768e',
    black: '#32344a',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
  },
  {
    name: 'One Dark',
    isDark: true,
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    black: '#282c34',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#d19a66',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
  },
  {
    name: 'Monokai',
    isDark: true,
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
  },
  {
    name: 'Solarized Dark',
    isDark: true,
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
  },
  {
    name: 'Solarized Light',
    isDark: false,
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#586e75',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
  },
  {
    name: 'GitHub Light',
    isDark: false,
    background: '#ffffff',
    foreground: '#24292e',
    cursor: '#24292e',
    black: '#24292e',
    red: '#d73a49',
    green: '#28a745',
    yellow: '#dbab09',
    blue: '#005cc5',
    magenta: '#5a32a3',
    cyan: '#0598bc',
    white: '#6a737d',
  },
  {
    name: 'Nord',
    isDark: true,
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    black: '#3b4252',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
  },
  {
    name: 'Dracula',
    isDark: true,
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    black: '#21222c',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#6272a4',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
  },
  {
    name: 'Gruvbox Dark',
    isDark: true,
    background: '#282828',
    foreground: '#ebdbb2',
    cursor: '#ebdbb2',
    black: '#282828',
    red: '#cc241d',
    green: '#98971a',
    yellow: '#d79921',
    blue: '#458588',
    magenta: '#b16286',
    cyan: '#689d6a',
    white: '#a89984',
  }
];

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left mb-6 overflow-auto max-h-40">
              <code className="text-xs text-destructive font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const FileExplorer: React.FC<{ 
  socket: Socket | null; 
  theme: TerminalTheme; 
  onClose: () => void;
  showHidden: boolean;
  defaultPath?: string;
}> = ({ socket, theme, onClose, showHidden, defaultPath }) => {
  const [currentPath, setCurrentPath] = useState(defaultPath || '/');
  const [files, setFiles] = useState<SftpFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (socket) {
      const handleListResult = (data: { path: string, files: SftpFile[] }) => {
        setFiles(data.files);
        setCurrentPath(data.path);
        setLoading(false);
      };

      const handleError = (err: { message: string, path: string }) => {
        setError(err.message);
        setLoading(false);
      };

      const handleDownloadResult = (data: { path: string, data: string, filename: string }) => {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${data.data}`;
        link.download = data.filename;
        link.click();
      };

      const handleUploadResult = (data: { path: string, success: boolean }) => {
        setUploading(false);
      };

      socket.on('sftp-list-result', handleListResult);
      socket.on('sftp-error', handleError);
      socket.on('sftp-download-result', handleDownloadResult);
      socket.on('sftp-upload-result', handleUploadResult);

      // Initial list
      setLoading(true);
      socket.emit('sftp-list', currentPath);

      return () => {
        socket.off('sftp-list-result', handleListResult);
        socket.off('sftp-error', handleError);
        socket.off('sftp-download-result', handleDownloadResult);
        socket.off('sftp-upload-result', handleUploadResult);
      };
    }
  }, [socket, currentPath]);

  const navigate = (path: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit('sftp-list', path);
  };

  const handleFileClick = (file: SftpFile) => {
    if (!socket) return;
    const isDir = (file.attrs.mode & 0o040000) === 0o040000;
    const fullPath = currentPath === '/' ? `/${file.filename}` : `${currentPath}/${file.filename}`;
    
    if (isDir) {
      navigate(fullPath);
    } else {
      socket.emit('sftp-download', fullPath);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigate('/' + parts.join('/'));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (mtime: number) => {
    return new Date(mtime * 1000).toLocaleString();
  };

  const getFileIcon = (file: SftpFile) => {
    const isDir = (file.attrs.mode & 0o040000) === 0o040000;
    if (isDir) return <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />;
    
    const ext = file.filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'md':
      case 'log':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return <Music className="w-4 h-4 text-pink-400" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar':
      case '7z':
        return <Archive className="w-4 h-4 text-yellow-400" />;
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'html':
      case 'css':
      case 'py':
      case 'go':
      case 'rs':
      case 'c':
      case 'cpp':
      case 'java':
      case 'json':
      case 'sh':
        return <Code className="w-4 h-4 text-green-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && socket) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        socket.emit('sftp-upload', {
          filePath: currentPath,
          data: base64,
          filename: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredFiles = files
    .filter(f => showHidden || !f.filename.startsWith('.'))
    .filter(f => f.filename.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aIsDir = (a.attrs.mode & 0o040000) === 0o040000;
      const bIsDir = (b.attrs.mode & 0o040000) === 0o040000;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.filename.localeCompare(b.filename);
    });

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-full shrink-0 shadow-2xl z-20 overflow-hidden">
      <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-accent/30">
        <div className="flex items-center gap-2 overflow-hidden">
          <HardDrive className="w-4 h-4 text-primary shrink-0" />
          <span className="font-bold text-sm truncate">SFTP Explorer</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 space-y-2 bg-accent/10">
        <div className="flex items-center gap-1">
          <button 
            onClick={goUp} 
            disabled={currentPath === '/'}
            className="p-1.5 hover:bg-accent rounded-md disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-accent/50 rounded-md px-2 py-1 text-[10px] font-mono truncate border border-border/50">
            {currentPath}
          </div>
          <label className="p-1.5 hover:bg-accent rounded-md transition-colors cursor-pointer">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4" />}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search files..."
            className="w-full bg-accent/50 border border-border rounded-md pl-8 pr-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading files...</span>
          </div>
        ) : error ? (
          <div className="p-4 flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Access Denied</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => navigate(currentPath)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredFiles.map((file, idx) => (
              <div 
                key={idx}
                onClick={() => handleFileClick(file)}
                className="group flex items-center gap-3 px-3 py-2 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {file.filename}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatSize(file.attrs.size)}</span>
                    <span className="opacity-30">•</span>
                    <span>{formatDate(file.attrs.mtime)}</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {(file.attrs.mode & 0o040000) !== 0o040000 && (
                    <Download className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  )}
                </div>
              </div>
            ))}
            {filteredFiles.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground italic">
                No files found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TerminalComponent: React.FC<{ 
  session: TerminalSession; 
  onDisconnect: () => void;
  theme?: TerminalTheme;
  fontSize: number;
  fontFamily: string;
  cursorStyle: 'block' | 'underline' | 'bar';
  cursorBlink: boolean;
  scrollback: number;
  isActive: boolean;
  showSftp: boolean;
  onToggleSftp: () => void;
  sftpShowHidden: boolean;
  sftpDefaultPath?: string;
  showSearch: boolean;
  searchTerm: string;
  searchNextTrigger: number;
  searchPrevTrigger: number;
  themeMode: 'light' | 'dark';
  autoReconnect: boolean;
  onStatusChange?: (status: TerminalSession['status']) => void;
}> = ({ 
  session, 
  onDisconnect, 
  theme = THEMES[0], 
  fontSize, 
  fontFamily, 
  cursorStyle, 
  cursorBlink, 
  scrollback, 
  isActive,
  showSftp,
  onToggleSftp,
  sftpShowHidden,
  sftpDefaultPath,
  showSearch,
  searchTerm,
  searchNextTrigger,
  searchPrevTrigger,
  themeMode,
  autoReconnect,
  onStatusChange
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<TerminalSession['status']>(session.status);

  useEffect(() => {
    setStatus(session.status);
  }, [session.status]);

  useEffect(() => {
    if (isActive && xtermRef.current) {
      xtermRef.current.focus();
      try {
        if (terminalRef.current && terminalRef.current.offsetWidth > 0 && xtermRef.current.element) {
          fitAddonRef.current?.fit();
          socketRef.current?.emit('ssh-resize', xtermRef.current.cols, xtermRef.current.rows);
        }
      } catch (e) {}
    }
  }, [isActive]);

  useEffect(() => {
    const term = xtermRef.current;
    if (!term) return;

    term.options.fontSize = fontSize;
    term.options.fontFamily = fontFamily;
    term.options.cursorStyle = cursorStyle;
    term.options.cursorBlink = cursorBlink;
    term.options.scrollback = scrollback;
    term.options.theme = {
      background: theme.background,
      foreground: theme.foreground,
      cursor: theme.cursor,
      black: theme.black,
      red: theme.red,
      green: theme.green,
      yellow: theme.yellow,
      blue: theme.blue,
      magenta: theme.magenta,
      cyan: theme.cyan,
      white: theme.white,
    };

    try {
      if (terminalRef.current && terminalRef.current.offsetWidth > 0 && term.element) {
        fitAddonRef.current?.fit();
      }
    } catch (e) {}
  }, [fontSize, fontFamily, cursorStyle, cursorBlink, scrollback, theme]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: cursorBlink,
      cursorStyle: cursorStyle,
      fontSize: fontSize,
      fontFamily: fontFamily,
      scrollback: scrollback,
      theme: {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
      },
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(new WebLinksAddon());
    
    term.open(terminalRef.current);
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    const initialFit = () => {
      try {
        if (terminalRef.current && terminalRef.current.offsetWidth > 0 && xtermRef.current?.element) {
          fitAddon.fit();
          if (socketRef.current) {
            socketRef.current.emit('ssh-resize', term.cols, term.rows);
          }
        }
      } catch (e) {
        // Retry once if it fails
        setTimeout(initialFit, 100);
      }
    };

    // Delay initial fit to ensure renderer is ready
    const fitTimeout = setTimeout(initialFit, 64);

    const socket = io();
    socketRef.current = socket;

    socket.emit('ssh-connect', session.config);

    socket.on('ssh-ready', () => {
      term.write('\r\n\x1b[1;32mConnected to ' + session.config.host + '\x1b[0m\r\n');
      setStatus('connected');
      onStatusChange?.('connected');
    });

    socket.on('ssh-output', (data: string) => {
      term.write(data);
    });

    socket.on('ssh-error', (error: string) => {
      term.write('\r\n\x1b[1;31mError: ' + error + '\x1b[0m\r\n');
      setStatus('error');
      onStatusChange?.('error');
      
      if (autoReconnect) {
        term.write('\r\n\x1b[1;33mAuto-reconnecting in 5 seconds...\x1b[0m\r\n');
        setTimeout(() => {
          if (socketRef.current) {
            setStatus('connecting');
            onStatusChange?.('connecting');
            socketRef.current.emit('ssh-connect', session.config);
          }
        }, 5000);
      }
    });

    socket.on('ssh-closed', () => {
      term.write('\r\n\x1b[1;33mConnection closed\x1b[0m\r\n');
      const prevStatus = status;
      setStatus('disconnected');
      onStatusChange?.('disconnected');
      
      if (autoReconnect && prevStatus === 'connected') {
        term.write('\x1b[1;33mAuto-reconnecting in 5 seconds...\x1b[0m\r\n');
        setTimeout(() => {
          if (socketRef.current) {
            setStatus('connecting');
            onStatusChange?.('connecting');
            socketRef.current.emit('ssh-connect', session.config);
          }
        }, 5000);
      } else {
        onDisconnect();
      }
    });

    term.onData((data) => {
      socket.emit('ssh-input', data);
    });

    const handleResize = () => {
      const term = xtermRef.current;
      const fitAddon = fitAddonRef.current;
      const container = terminalRef.current;
      const socket = socketRef.current;

      if (!term || !fitAddon || !container || !socket) return;
      
      try {
        // Check if terminal is likely opened and visible and has a renderer
        if (container.offsetWidth > 0 && container.offsetHeight > 0 && term.element) {
          fitAddon.fit();
          socket.emit('ssh-resize', term.cols, term.rows);
        }
      } catch (e) {
        // Ignore fit errors during transitions or if renderer not ready
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      clearTimeout(fitTimeout);
      resizeObserver.disconnect();
      socket.disconnect();
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
    };
  }, [session.config]);

  useEffect(() => {
    if (showSearch && searchTerm && searchAddonRef.current) {
      searchAddonRef.current.findNext(searchTerm, {
        incremental: true,
        caseSensitive: false,
        wholeWord: false
      });
    }
  }, [searchTerm, showSearch]);

  // Handle manual next/prev triggers
  useEffect(() => {
    if (searchNextTrigger > 0 && searchAddonRef.current && searchTerm) {
      searchAddonRef.current.findNext(searchTerm);
    }
  }, [searchNextTrigger]);

  useEffect(() => {
    if (searchPrevTrigger > 0 && searchAddonRef.current && searchTerm) {
      searchAddonRef.current.findPrevious(searchTerm);
    }
  }, [searchPrevTrigger]);

  return (
    <div className="flex h-full w-full overflow-hidden min-w-0" style={{ backgroundColor: theme.background }}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <div ref={terminalRef} className="w-full h-full p-1 overflow-hidden" />
        </div>
        {/* Status Bar */}
        <div className={`h-6 border-t border-border/10 flex items-center px-3 gap-4 text-[10px] font-mono bg-black/20 shrink-0 ${theme.isDark ? 'text-white/60' : 'text-black/60'}`}>
          <div className="flex items-center gap-1.5">
            <Activity className={`w-3 h-3 ${status === 'connected' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
            <div className={`px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wider ${
              status === 'connected' ? 'bg-green-600' : 
              status === 'error' ? 'bg-red-600' : 
              status === 'connecting' ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>
              {status === 'connecting' ? 'CONNECTING' : status === 'connected' ? 'CONNECTED' : status === 'error' ? 'FAILED' : 'DISCONNECTED'}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="w-3 h-3" />
            <span className={`font-medium ${theme.isDark ? 'text-white' : 'text-black'}`}>{session.config.host}:{session.config.port}</span>
          </div>
          <div className={`ml-auto flex items-center gap-3 ${theme.isDark ? 'text-white' : 'text-black'}`}>
            <span>UTF-8</span>
            <span>SSHv2</span>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showSftp && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 350, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full border-l border-border bg-card overflow-hidden flex flex-col shrink-0"
          >
            <FileExplorer 
              socket={socketRef.current} 
              theme={theme} 
              onClose={onToggleSftp}
              showHidden={sftpShowHidden}
              defaultPath={sftpDefaultPath}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const getInitialThemeMode = () => {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 7) ? 'dark' : 'light';
  };

  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [connections, setConnections] = useState<SSHConfig[]>([]);
  const [selectedThemeName, setSelectedThemeName] = useState('Tokyo Night');

  useEffect(() => {
    const theme = THEMES.find(t => t.name === selectedThemeName) || THEMES[0];
    setSessions(prev => prev.map(s => ({ ...s, theme })));
  }, [selectedThemeName]);
  const [terminalFontSize, setTerminalFontSize] = useState(14);
  const [terminalFontFamily, setTerminalFontFamily] = useState('"JetBrains Mono", "Fira Code", monospace');
  const [cursorStyle, setCursorStyle] = useState<'block' | 'underline' | 'bar'>('block');
  const [cursorBlink, setCursorBlink] = useState(true);
  const [scrollback, setScrollback] = useState(1000);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [showHostInSidebar, setShowHostInSidebar] = useState(true);
  const [confirmOnClose, setConfirmOnClose] = useState(true);
  const [confirmOnDeletion, setConfirmOnDeletion] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [defaultUsername, setDefaultUsername] = useState('');
  const [defaultPort, setDefaultPort] = useState(22);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(getInitialThemeMode());
  const [showSftpPanel, setShowSftpPanel] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchNextTrigger, setSearchNextTrigger] = useState(0);
  const [searchPrevTrigger, setSearchPrevTrigger] = useState(0);
  const [sftpDefaultPath, setSftpDefaultPath] = useState('/');
  const [sftpShowHiddenFiles, setSftpShowHiddenFiles] = useState(false);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'terminal' | 'general'>('appearance');
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'default': true });
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [newConfig, setNewConfig] = useState<Partial<SSHConfig>>({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    groupId: 'default',
    privateKey: '',
    passphrase: '',
  });
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data: AppConfig = await res.json();
      setGroups(data.groups);
      setConnections(data.connections);
      setSelectedThemeName(data.selectedTheme);
      setTerminalFontSize(data.terminalFontSize || 14);
      setTerminalFontFamily(data.terminalFontFamily || '"JetBrains Mono", "Fira Code", monospace');
      setCursorStyle(data.cursorStyle || 'block');
      setCursorBlink(data.cursorBlink !== undefined ? data.cursorBlink : true);
      setScrollback(data.scrollback || 1000);
      setSidebarWidth(data.sidebarWidth || 256);
      setShowHostInSidebar(data.showHostInSidebar !== undefined ? data.showHostInSidebar : true);
      setConfirmOnClose(data.confirmOnClose !== undefined ? data.confirmOnClose : true);
      setAutoReconnect(data.autoReconnect !== undefined ? data.autoReconnect : false);
      setDefaultUsername(data.defaultUsername || '');
      setDefaultPort(data.defaultPort || 22);
      setThemeMode(data.themeMode || getInitialThemeMode());
      setShowSftpPanel(data.showSftpPanel !== undefined ? data.showSftpPanel : true);
      setSftpDefaultPath(data.sftpDefaultPath || '/');
      setSftpShowHiddenFiles(data.sftpShowHiddenFiles !== undefined ? data.sftpShowHiddenFiles : false);
      
      // Update newConfig defaults if they are empty
      setNewConfig(prev => ({
        ...prev,
        username: prev.username || data.defaultUsername || '',
        port: prev.port || data.defaultPort || 22
      }));
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  const saveAppConfig = async (
    updatedGroups: Group[], 
    updatedConnections: SSHConfig[], 
    theme: string,
    extra?: Partial<AppConfig>
  ) => {
    try {
      const config: AppConfig = {
        groups: updatedGroups,
        connections: updatedConnections,
        selectedTheme: theme,
        terminalFontSize: extra?.terminalFontSize ?? terminalFontSize,
        terminalFontFamily: extra?.terminalFontFamily ?? terminalFontFamily,
        cursorStyle: extra?.cursorStyle ?? cursorStyle,
        cursorBlink: extra?.cursorBlink ?? cursorBlink,
        scrollback: extra?.scrollback ?? scrollback,
        sidebarWidth: extra?.sidebarWidth ?? sidebarWidth,
        showHostInSidebar: extra?.showHostInSidebar ?? showHostInSidebar,
        confirmOnClose: extra?.confirmOnClose ?? confirmOnClose,
        confirmOnDeletion: extra?.confirmOnDeletion ?? confirmOnDeletion,
        autoReconnect: extra?.autoReconnect ?? autoReconnect,
        defaultUsername: extra?.defaultUsername ?? defaultUsername,
        defaultPort: extra?.defaultPort ?? defaultPort,
        themeMode: extra?.themeMode ?? themeMode,
        showSftpPanel: extra?.showSftpPanel ?? showSftpPanel,
        sftpDefaultPath: extra?.sftpDefaultPath ?? sftpDefaultPath,
        sftpShowHiddenFiles: extra?.sftpShowHiddenFiles ?? sftpShowHiddenFiles
      };
      
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const addConnection = () => {
    if (editingConnectionId) {
      const updated = connections.map(c => 
        c.id === editingConnectionId ? { ...newConfig as SSHConfig, id: editingConnectionId } : c
      );
      setConnections(updated);
      saveAppConfig(groups, updated, selectedThemeName);
      setEditingConnectionId(null);
    } else {
      const config: SSHConfig = {
        ...newConfig as SSHConfig,
        id: Math.random().toString(36).substr(2, 9),
      };
      const updated = [...connections, config];
      setConnections(updated);
      saveAppConfig(groups, updated, selectedThemeName);
      startSession(config); // Connect immediately
    }
    setShowNewSessionModal(false);
    setNewConfig({
      name: '',
      host: '',
      port: defaultPort,
      username: defaultUsername,
      password: '',
      groupId: 'default',
      privateKey: '',
      passphrase: '',
    });
  };

  const deleteConnection = (id: string) => {
    const performDelete = () => {
      const updated = connections.filter(c => c.id !== id);
      setConnections(updated);
      saveAppConfig(groups, updated, selectedThemeName);
    };

    if (confirmOnDeletion) {
      setConfirmModal({
        show: true,
        title: 'Delete Connection',
        message: 'Are you sure you want to delete this connection? This action cannot be undone.',
        onConfirm: performDelete,
      });
    } else {
      performDelete();
    }
  };

  const addGroup = () => {
    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Group'
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    setEditingGroupId(newGroup.id);
    setEditingGroupName(newGroup.name);
    saveAppConfig(updated, connections, selectedThemeName);
  };

  const renameGroup = (id: string, newName: string) => {
    const updated = groups.map(g => g.id === id ? { ...g, name: newName } : g);
    setGroups(updated);
    setEditingGroupId(null);
    saveAppConfig(updated, connections, selectedThemeName);
  };

  const deleteGroup = (id: string) => {
    if (id === 'default') return;
    const updatedGroups = groups.filter(g => g.id !== id);
    const updatedConnections = connections.map(c => 
      c.groupId === id ? { ...c, groupId: 'default' } : c
    );
    setGroups(updatedGroups);
    setConnections(updatedConnections);
    saveAppConfig(updatedGroups, updatedConnections, selectedThemeName);
  };

  const moveConnectionToGroup = (connectionId: string, targetGroupId: string) => {
    const updated = connections.map(c => 
      c.id === connectionId ? { ...c, groupId: targetGroupId } : c
    );
    setConnections(updated);
    saveAppConfig(groups, updated, selectedThemeName);
  };

  const startSession = (config: SSHConfig) => {
    const theme = THEMES.find(t => t.name === selectedThemeName) || THEMES[0];
    const newSession: TerminalSession = {
      id: Math.random().toString(36).substr(2, 9),
      config,
      status: 'connecting',
      theme
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
    setShowNewSessionModal(false);
  };

  const closeSession = (id: string) => {
    const performClose = () => {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[updated.length - 1].id : null);
      }
    };

    if (confirmOnClose) {
      setConfirmModal({
        show: true,
        title: 'Close Session',
        message: 'Are you sure you want to close this terminal session?',
        onConfirm: performClose,
      });
    } else {
      performClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewConfig({ ...newConfig, privateKey: event.target?.result as string });
      };
      reader.readAsText(file);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const currentTheme = THEMES.find(t => t.name === selectedThemeName) || THEMES[0];

  return (
    <div className="flex h-screen w-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <div 
        className="border-r border-border flex flex-col bg-card relative group/sidebar"
        style={{ width: sidebarWidth }}
      >
        {/* Resize Handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-50"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            
            const onMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(600, startWidth + (moveEvent.clientX - startX)));
              setSidebarWidth(newWidth);
            };
            
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              saveAppConfig(groups, connections, selectedThemeName, { sidebarWidth });
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
        <div className="h-12 px-4 flex items-center justify-between bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground tracking-tight text-xl">WebSSH</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                const newMode = themeMode === 'light' ? 'dark' : 'light';
                setThemeMode(newMode);
                saveAppConfig(groups, connections, selectedThemeName, { themeMode: newMode });
              }}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground"
              title={themeMode === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsEditingMode(!isEditingMode)}
              className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 ${isEditingMode ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent text-muted-foreground'}`}
              title={isEditingMode ? "Done Editing" : "Edit Connections"}
            >
              {isEditingMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
            {!isEditingMode && (
              <button 
                onClick={() => setShowNewSessionModal(true)}
                className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground"
                title="New Connection"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {isEditingMode && (
            <div className="px-2 pb-2">
              <button 
                onClick={() => addGroup()}
                className="w-full h-9 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium"
              >
                <FolderPlus className="w-4 h-4" />
                Add New Group
              </button>
            </div>
          )}
          {groups.map(group => (
            <div 
              key={group.id} 
              className="space-y-1"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-blue-900/10');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-900/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-900/10');
                const connectionId = e.dataTransfer.getData('connectionId');
                if (connectionId) {
                  moveConnectionToGroup(connectionId, group.id);
                }
              }}
            >
              <div className="group/header flex items-center justify-between px-2 py-1">
                <button 
                  onClick={() => setExpandedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="flex items-center gap-2 text-sm tracking-wider text-muted-foreground font-bold hover:text-foreground transition-colors"
                >
                  {expandedGroups[group.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {editingGroupId === group.id ? (
                    <input 
                      autoFocus
                      className="bg-accent border-none outline-none px-1 rounded text-foreground w-32"
                      value={editingGroupName}
                      onChange={e => setEditingGroupName(e.target.value)}
                      onBlur={() => renameGroup(group.id, editingGroupName)}
                      onKeyDown={e => e.key === 'Enter' && renameGroup(group.id, editingGroupName)}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span>{group.name}</span>
                  )}
                </button>
                
                <div className={`flex items-center gap-1 transition-opacity ${isEditingMode ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'}`}>
                  <button 
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingGroupName(group.name);
                    }}
                    className="p-1 hover:text-primary text-muted-foreground"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {group.id !== 'default' && (
                    <button 
                      onClick={() => deleteGroup(group.id)}
                      className="p-1 hover:text-destructive text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <AnimatePresence initial={false}>
                {expandedGroups[group.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {connections.filter(c => c.groupId === group.id).map(config => (
                      <div 
                        key={config.id}
                        draggable={isEditingMode}
                        onDragStart={(e) => {
                          if (!isEditingMode) return;
                          e.dataTransfer.setData('connectionId', config.id);
                          e.currentTarget.classList.add('opacity-50');
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50');
                        }}
                        className={`group flex items-center justify-between p-2.5 rounded-lg transition-all border border-transparent ${isEditingMode ? 'cursor-grab active:cursor-grabbing border-border bg-accent/30' : 'hover:bg-accent cursor-pointer hover:border-border'}`}
                        onClick={() => !isEditingMode && startSession(config)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${isEditingMode ? '' : 'group-hover:bg-primary/10'}`}>
                            <Server className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-base font-medium text-foreground truncate">{config.name}</span>
                            {showHostInSidebar && (
                              <span className="text-sm text-muted-foreground truncate">{config.host}</span>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 transition-all ${isEditingMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingConnectionId(config.id);
                              setNewConfig(config);
                              setAuthMethod(config.privateKey ? 'key' : 'password');
                              setShowNewSessionModal(true);
                            }}
                            className="p-1.5 hover:text-primary text-muted-foreground transition-colors"
                            title="Edit Connection"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConnection(config.id);
                            }}
                            className="p-1.5 hover:text-destructive text-muted-foreground transition-colors"
                            title="Delete Connection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {connections.filter(c => c.groupId === group.id).length === 0 && (
                      <div className="px-8 py-2 text-xs text-muted-foreground/50 italic">No connections</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">System Ready</span>
            </div>
            <button 
              onClick={() => {
                const newMode = themeMode === 'light' ? 'dark' : 'light';
                setThemeMode(newMode);
                saveAppConfig(groups, connections, selectedThemeName, { themeMode: newMode });
                
                // Suggest dark terminal theme if current is light and switching to dark mode
                if (newMode === 'dark') {
                  const currentTheme = THEMES.find(t => t.name === selectedThemeName);
                  if (!currentTheme?.isDark) {
                    setSelectedThemeName('Tokyo Night');
                    saveAppConfig(groups, connections, 'Tokyo Night', { themeMode: 'dark' });
                  }
                }
              }}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all border border-border/50 shadow-sm"
              title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            >
              {themeMode === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-10"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            
            const onMouseMove = (moveE: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(450, startWidth + (moveE.clientX - startX)));
              setSidebarWidth(newWidth);
            };
            
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              saveAppConfig(groups, connections, selectedThemeName, { sidebarWidth });
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Tabs */}
        <div className="h-10 border-b border-border flex items-center bg-card/80 backdrop-blur-md px-2 gap-1 overflow-x-auto no-scrollbar">
          <AnimatePresence mode="popLayout">
            {sessions.map(session => (
              <motion.div 
                key={session.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setActiveSessionId(session.id)}
                className={`
                  flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-all min-w-[100px] max-w-[200px] relative group h-8
                  ${activeSessionId === session.id 
                    ? 'bg-background text-primary shadow-sm border border-border/50' 
                    : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'}
                `}
              >
                <Monitor className={`w-3.5 h-3.5 ${activeSessionId === session.id ? 'text-primary' : 'text-muted-foreground/40'}`} />
                <span className="text-sm font-bold tracking-tight truncate flex-1">{session.config.name || session.config.host}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(session.id);
                  }}
                  className={`
                    p-0.5 rounded-md transition-all
                    ${activeSessionId === session.id 
                      ? 'hover:bg-destructive/10 hover:text-destructive' 
                      : 'opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive'}
                  `}
                  title="Close Session"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {activeSessionId === session.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[1px] left-2 right-2 h-[2px] bg-primary rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <button 
            onClick={() => setShowNewSessionModal(true)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all ml-1 flex-shrink-0"
            title="New Session"
          >
            <Plus className="w-4 h-4" />
          </button>

          {activeSession && (
            <div className="flex items-center gap-1 ml-auto">
              {showSearch && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  className="relative flex items-center gap-1"
                >
                  <div className="relative flex-1">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-7 w-full bg-accent text-[11px] border border-border rounded-md pl-2 pr-6 outline-none focus:ring-1 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowSearch(false);
                          setSearchTerm('');
                        }
                        if (e.key === 'Enter') {
                          // Trigger find next on enter
                          setSearchTerm(prev => prev); // trigger effect
                        }
                      }}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded text-muted-foreground"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center bg-accent border border-border rounded-md h-7 px-1">
                    <button 
                      onClick={() => setSearchNextTrigger(prev => prev + 1)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Next"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setSearchPrevTrigger(prev => prev + 1)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Previous"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1.5 rounded-full transition-all flex-shrink-0 ${showSearch ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                title="Search Terminal"
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowSftpPanel(!showSftpPanel)}
                className={`p-1.5 rounded-full transition-all flex-shrink-0 ${showSftpPanel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                title="Toggle File Explorer (SFTP)"
              >
                <HardDrive className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Terminal Area */}
        <div className="flex-1 relative" style={{ backgroundColor: sessions.length === 0 ? 'transparent' : currentTheme.background }}>
          {sessions.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border border-border">
                <TerminalIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">No Active Sessions</h2>
                <p className="text-sm text-muted-foreground mt-2">Connect to a server to start your terminal</p>
              </div>
              <button 
                onClick={() => setShowNewSessionModal(true)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Connection
              </button>
            </div>
          ) : (
            <div className="absolute inset-0">
              {sessions.map(session => (
                <div 
                  key={session.id}
                  className={`absolute inset-0 transition-opacity duration-200 ${activeSessionId === session.id ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
                >
                  <TerminalComponent 
                    session={session} 
                    onDisconnect={() => closeSession(session.id)} 
                    theme={session.theme}
                    fontSize={terminalFontSize}
                    fontFamily={terminalFontFamily}
                    cursorStyle={cursorStyle}
                    cursorBlink={cursorBlink}
                    scrollback={scrollback}
                    isActive={activeSessionId === session.id}
                    showSftp={showSftpPanel}
                    onToggleSftp={() => {
                      const newVal = !showSftpPanel;
                      setShowSftpPanel(newVal);
                      saveAppConfig(groups, connections, selectedThemeName, { showSftpPanel: newVal });
                    }}
                    sftpShowHidden={sftpShowHiddenFiles}
                    sftpDefaultPath={sftpDefaultPath}
                    showSearch={showSearch}
                    searchTerm={searchTerm}
                    searchNextTrigger={searchNextTrigger}
                    searchPrevTrigger={searchPrevTrigger}
                    themeMode={themeMode}
                    autoReconnect={autoReconnect}
                    onStatusChange={(status) => {
                      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status } : s));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      <AnimatePresence>
        {showNewSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {editingConnectionId ? 'Edit Connection' : 'New Connection'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setShowNewSessionModal(false);
                    setEditingConnectionId(null);
                  }} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar bg-background">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Session Name</div>
                    <input 
                      type="text" 
                      placeholder="My Server"
                      className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      value={newConfig.name}
                      onChange={e => setNewConfig({...newConfig, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Group</div>
                    <select 
                      className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      value={newConfig.groupId}
                      onChange={e => setNewConfig({...newConfig, groupId: e.target.value})}
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Host / IP Address</div>
                    <div className="relative">
                      <Monitor className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="192.168.1.100"
                        className="w-full bg-accent/50 border border-border rounded-lg pl-9 pr-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                        value={newConfig.host}
                        onChange={e => setNewConfig({...newConfig, host: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Port</div>
                    <input 
                      type="number" 
                      placeholder="22"
                      className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      value={newConfig.port}
                      onChange={e => setNewConfig({...newConfig, port: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Username</div>
                    <div className="relative">
                      <Database className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="root"
                        className="w-full bg-accent/50 border border-border rounded-lg pl-9 pr-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                        value={newConfig.username}
                        onChange={e => setNewConfig({...newConfig, username: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-foreground">Auth Method</div>
                    <div className="flex bg-accent rounded-lg p-1 border border-border h-8">
                      <button 
                        onClick={() => setAuthMethod('password')}
                        className={`flex-1 rounded-md text-[10px] font-bold uppercase transition-all ${authMethod === 'password' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Password
                      </button>
                      <button 
                        onClick={() => setAuthMethod('key')}
                        className={`flex-1 rounded-md text-[10px] font-bold uppercase transition-all ${authMethod === 'key' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Private Key
                      </button>
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={false}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="overflow-hidden"
                >
                  {authMethod === 'password' ? (
                        <div className="space-y-1.5">
                          <div className="text-sm font-bold text-foreground">Password</div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              className="w-full bg-accent/50 border border-border rounded-lg pl-9 pr-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                              value={newConfig.password}
                              onChange={e => setNewConfig({...newConfig, password: e.target.value})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-foreground">Private Key</div>
                              <label className="cursor-pointer text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 font-bold">
                                <Upload className="w-3 h-3" />
                                Upload
                                <input type="file" className="hidden" onChange={handleFileChange} />
                              </label>
                            </div>
                            <textarea 
                              placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                              className="w-full h-20 bg-accent/50 border border-border rounded-lg px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-primary transition-colors resize-none text-foreground"
                              value={newConfig.privateKey}
                              onChange={e => setNewConfig({...newConfig, privateKey: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-foreground">Passphrase (Optional)</div>
                            <div className="relative">
                              <Key className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
                              <input 
                                type="password" 
                                placeholder="Key passphrase"
                                className="w-full bg-accent/50 border border-border rounded-lg pl-9 pr-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                                value={newConfig.passphrase}
                                onChange={e => setNewConfig({...newConfig, passphrase: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                  )}
                </motion.div>
              </div>

              <div className="p-5 bg-accent/50 border-t border-border flex gap-3">
                <button 
                  onClick={() => {
                    setShowNewSessionModal(false);
                    setEditingConnectionId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors text-muted-foreground"
                >
                  Cancel
                </button>
                <button 
                  onClick={addConnection}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20"
                >
                  {editingConnectionId ? 'Update Connection' : 'Save & Connect'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Settings</h3>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden bg-background">
                {/* Settings Sidebar */}
                <div className="w-48 border-r border-border p-4 space-y-2 bg-card">
                  <button 
                    onClick={() => setSettingsTab('appearance')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsTab === 'appearance' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                  >
                    <Palette className="w-4 h-4" />
                    Appearance
                  </button>
                  <button 
                    onClick={() => setSettingsTab('terminal')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsTab === 'terminal' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                  >
                    <TerminalIcon className="w-4 h-4" />
                    Terminal
                  </button>
                  <button 
                    onClick={() => setSettingsTab('general')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsTab === 'general' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                  >
                    <Layout className="w-4 h-4" />
                    General
                  </button>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8 bg-background">
                  {settingsTab === 'appearance' && (
                    <section className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <TerminalIcon className="w-4 h-4" />
                          Terminal Theme
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {THEMES.map(theme => (
                            <button 
                              key={theme.name}
                              onClick={() => {
                                setSelectedThemeName(theme.name);
                                saveAppConfig(groups, connections, theme.name);
                              }}
                              className={`p-3 rounded-xl border text-left transition-all ${selectedThemeName === theme.name ? 'border-primary bg-primary/5' : 'border-border bg-accent/50 hover:border-muted-foreground/30'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-foreground">{theme.name}</span>
                                {selectedThemeName === theme.name && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <div className="flex gap-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.background }} />
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.foreground }} />
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.blue }} />
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.green }} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}
                  {settingsTab === 'terminal' && (
                    <section className="space-y-6">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4" />
                        Terminal Customization
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-foreground">Font Size</div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setTerminalFontSize(14);
                                  saveAppConfig(groups, connections, selectedThemeName, { terminalFontSize: 14 });
                                }}
                                className="text-[10px] text-primary hover:underline font-bold"
                              >
                                Reset
                              </button>
                              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{terminalFontSize}px</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => {
                                const val = Math.max(10, terminalFontSize - 1);
                                setTerminalFontSize(val);
                                saveAppConfig(groups, connections, selectedThemeName, { terminalFontSize: val });
                              }}
                              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center text-foreground transition-colors border border-border/50"
                            >
                              <span className="text-lg font-bold">-</span>
                            </button>
                            <input 
                              type="range" 
                              min="10" 
                              max="24" 
                              value={terminalFontSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTerminalFontSize(val);
                                saveAppConfig(groups, connections, selectedThemeName, { terminalFontSize: val });
                              }}
                              className="flex-1 h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button 
                              onClick={() => {
                                const val = Math.min(24, terminalFontSize + 1);
                                setTerminalFontSize(val);
                                saveAppConfig(groups, connections, selectedThemeName, { terminalFontSize: val });
                              }}
                              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center text-foreground transition-colors border border-border/50"
                            >
                              <span className="text-lg font-bold">+</span>
                            </button>
                          </div>
                        </div>
  
                        <div className="space-y-1.5">
                          <div className="text-sm font-bold text-foreground">Font Family</div>
                          <div className="relative">
                            <Type className="absolute left-3 top-2 w-4 h-4 text-muted-foreground/60" />
                            <select 
                              className="w-full bg-accent/50 border border-border rounded-lg pl-10 pr-3 h-8 text-xs focus:outline-none focus:border-primary transition-colors appearance-none text-foreground"
                              value={terminalFontFamily}
                              onChange={(e) => {
                                setTerminalFontFamily(e.target.value);
                                saveAppConfig(groups, connections, selectedThemeName, { terminalFontFamily: e.target.value });
                              }}
                            >
                              <option value='"JetBrains Mono", "Fira Code", monospace'>JetBrains Mono</option>
                              <option value='"Fira Code", monospace'>Fira Code</option>
                              <option value='"Courier New", Courier, monospace'>Courier New</option>
                              <option value='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'>System Mono</option>
                            </select>
                          </div>
                        </div>
  
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-foreground">Cursor Style</div>
                            <div className="relative">
                              <MousePointer2 className="absolute left-3 top-2 w-4 h-4 text-muted-foreground/60" />
                              <select 
                                className="w-full bg-accent/50 border border-border rounded-lg pl-10 pr-3 h-8 text-xs focus:outline-none focus:border-primary transition-colors appearance-none text-foreground"
                                value={cursorStyle}
                                onChange={(e) => {
                                  const val = e.target.value as 'block' | 'underline' | 'bar';
                                  setCursorStyle(val);
                                  saveAppConfig(groups, connections, selectedThemeName, { cursorStyle: val });
                                }}
                              >
                                <option value="block">Block</option>
                                <option value="underline">Underline</option>
                                <option value="bar">Bar</option>
                              </select>
                            </div>
                          </div>
  
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-foreground">Cursor Blink</div>
                            <button 
                              onClick={() => {
                                const val = !cursorBlink;
                                setCursorBlink(val);
                                saveAppConfig(groups, connections, selectedThemeName, { cursorBlink: val });
                              }}
                              className={`w-full flex items-center justify-between px-3 h-8 rounded-lg border transition-all ${cursorBlink ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/50 border-border text-muted-foreground'}`}
                            >
                              <span className="text-xs">{cursorBlink ? 'Enabled' : 'Disabled'}</span>
                              <RefreshCw className={`w-3 h-3 ${cursorBlink ? 'animate-spin-slow' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-foreground">Scrollback Lines</div>
                            </div>
                            <div className="relative">
                              <History className="absolute left-3 top-2 w-4 h-4 text-muted-foreground/60" />
                              <input 
                                type="number" 
                                className="w-full bg-accent/50 border border-border rounded-lg pl-10 pr-3 h-8 text-xs focus:outline-none focus:border-primary transition-colors text-foreground"
                                value={scrollback}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setScrollback(val);
                                  saveAppConfig(groups, connections, selectedThemeName, { scrollback: val });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                  {settingsTab === 'general' && (
                    <section className="space-y-6">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        General Settings
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground">Show Host in Sidebar</div>
                            <div className="text-xs text-muted-foreground">Display the IP/Host address below the session name</div>
                          </div>
                          <button 
                            onClick={() => {
                              const newVal = !showHostInSidebar;
                              setShowHostInSidebar(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { showHostInSidebar: newVal });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${showHostInSidebar ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-primary-foreground transition-all ${showHostInSidebar ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground">Confirm on Close</div>
                            <div className="text-xs text-muted-foreground">Ask for confirmation before closing a terminal session</div>
                          </div>
                          <button 
                            onClick={() => {
                              const newVal = !confirmOnClose;
                              setConfirmOnClose(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { confirmOnClose: newVal });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${confirmOnClose ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-primary-foreground transition-all ${confirmOnClose ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground">Auto Reconnect</div>
                            <div className="text-xs text-muted-foreground">Automatically attempt to reconnect if the connection is lost</div>
                          </div>
                          <button 
                            onClick={() => {
                              const newVal = !autoReconnect;
                              setAutoReconnect(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { autoReconnect: newVal });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${autoReconnect ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-primary-foreground transition-all ${autoReconnect ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground">Confirm on Deletion</div>
                            <div className="text-xs text-muted-foreground">Ask for confirmation before deleting a connection</div>
                          </div>
                          <button 
                            onClick={() => {
                              const newVal = !confirmOnDeletion;
                              setConfirmOnDeletion(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { confirmOnDeletion: newVal });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${confirmOnDeletion ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-primary-foreground transition-all ${confirmOnDeletion ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground">Show Hidden Files</div>
                            <div className="text-xs text-muted-foreground">Display files starting with a dot in the SFTP explorer</div>
                          </div>
                          <button 
                            onClick={() => {
                              const newVal = !sftpShowHiddenFiles;
                              setSftpShowHiddenFiles(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { sftpShowHiddenFiles: newVal });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${sftpShowHiddenFiles ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-primary-foreground transition-all ${sftpShowHiddenFiles ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-sm font-bold text-foreground">SFTP Default Path</div>
                          <input 
                            type="text" 
                            placeholder="/"
                            className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                            value={sftpDefaultPath}
                            onChange={e => {
                              const newVal = e.target.value;
                              setSftpDefaultPath(newVal);
                              saveAppConfig(groups, connections, selectedThemeName, { sftpDefaultPath: newVal });
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-foreground">Default Username</div>
                            <input 
                              type="text" 
                              placeholder="root"
                              className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                              value={defaultUsername}
                              onChange={e => {
                                const newVal = e.target.value;
                                setDefaultUsername(newVal);
                                saveAppConfig(groups, connections, selectedThemeName, { defaultUsername: newVal });
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-foreground">Default Port</div>
                            <input 
                              type="number" 
                              placeholder="22"
                              className="w-full bg-accent/50 border border-border rounded-lg px-3 h-8 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                              value={defaultPort}
                              onChange={e => {
                                const newVal = parseInt(e.target.value) || 22;
                                setDefaultPort(newVal);
                                saveAppConfig(groups, connections, selectedThemeName, { defaultPort: newVal });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-foreground">{confirmModal.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {confirmModal.message}
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                    className="px-4 py-2 rounded-xl hover:bg-accent transition-colors text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(prev => ({ ...prev, show: false }));
                    }}
                    className="px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-primary/20"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
