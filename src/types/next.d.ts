declare module 'next/server' {
  export class NextRequest extends Request {
    public nextUrl: URL;
    public cookies: any;
    public geo?: any;
    public ip?: string;
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(init?: any): NextResponse;
  }
}
