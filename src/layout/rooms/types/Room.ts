type IRoomConstructor = {
  left?: TypeRoom | undefined;
  right?: TypeRoom | undefined;
  forward?: TypeRoom | undefined;
  back?: TypeRoom | undefined;
  up?: TypeRoom | undefined;
  down?: TypeRoom | undefined;
};

interface TypeRoom {
  addConnections: (connections: IRoomConstructor) => void;
  description: () => void;
  left: () => TypeRoom;
  right: () => TypeRoom;
  forward: () => TypeRoom;
  back: () => TypeRoom;
  up: () => TypeRoom;
  down: () => TypeRoom;
}

export default TypeRoom;