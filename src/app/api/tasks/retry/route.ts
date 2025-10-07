import { NextResponse } from 'next/server';

export async function PUT(req: Request) {

  try {
    const url = new URL(req.url);
    const priority = url.searchParams.get('priority') ?? 'false';
    const payload = await req.json();


    const apiKey = process.env.MAKER_API_KEY || '5876cff5-5184-41de-9b97-7060e173ecfb';     
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing MAKER_API_KEY' },
        { status: 500 }
      );
    }

    // Normalizamos el payload:
    // - Si viene 'es' en lugar de 'index', lo mapeamos a 'index'
    // - Convertimos índices de 0-based a 1-based para el upstream
    const { task, retry, fromScript } = payload || {};
    

    const normalizedRetry = retry && Array.isArray(retry.sections)
      ? {
          sections: retry.sections.map((section: any) => ({
            sectionId: section.sectionId,
            remakeALL: section.remakeALL,
            texts: Array.isArray(section.texts)
              ? section.texts.map((t: any) => {
                  const idxRaw =
                    typeof t.index === 'number'
                      ? t.index
                      : typeof t.es === 'number'
                      ? t.es
                      : undefined;
                  const out: any = {
                    regen: Boolean(t.regen),
                  };
                  if (typeof idxRaw === 'number') {
                    out.index = fromScript ? idxRaw : idxRaw + 1;
                  }
                  if ('textToUse' in t) {
                    out.textToUse = t.textToUse ?? null;
                  }
                  return out;
                })
              : [],
          })),
        }
      : null;

    const upstreamPayload = {
      task,
      retry: normalizedRetry,
    };

    const upstreamUrl = `https://mm-hypnosis-api-production-bmfr9.ondigitalocean.app/v1/maker/tasks/create/retry?priority=${encodeURIComponent(priority)}`;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      const upstreamText = await upstreamResponse.text().catch(() => '');
      return NextResponse.json(
        { error: 'Upstream error', status: upstreamResponse.status, body: upstreamText },
        { status: upstreamResponse.status }
      );
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const text = await upstreamResponse.text();
    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('Error proxying retry task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}