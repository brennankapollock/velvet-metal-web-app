// musickit.d.ts
declare namespace MusicKit {
  interface Configuration {
    developerToken: string;
    app: {
      name: string;
      build: string;
    };
  }

  interface Instance {
    authorize(): Promise<any>;
    unauthorize(): Promise<any>;
    isAuthorized: boolean;
    api: any;
    player: {
      play(): Promise<void>;
      pause(): Promise<void>;
      stop(): Promise<void>;
      seekToTime(time: number): Promise<void>;
      playNext(): Promise<void>;
      playPrevious(): Promise<void>;
      queue: any;
    };
    library: any;
    audioTrack: any;
  }

  function configure(configuration: Configuration): Instance;
  function getInstance(): Instance;
  const version: string;
  const MusicKitInstance: Instance;
}

// Declare MusicKit as a global variable
declare const MusicKit: typeof MusicKit;
