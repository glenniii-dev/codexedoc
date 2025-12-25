export default interface Circle {
  id: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  ownerId: string;
  domainIds: string[];
  threadIds: string[];
  brainstormIds: string[];
  circleCodexId: string | null;
  members: {
    id: string;
    username: string;
    name: string;
    image: string;
    role: string;
  }[];
  domains: {
    id: string;
    name: string;
    threadIds: string[];
  }[];
  threads: {
    id: string;
    name: string;
    messageIds: string[];
  }[];
  messages: {
    id: string;
    userId: string;
    message: string;
    image: string | null;
    timestamp: string;
  }[];
}