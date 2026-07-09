import { RELATED_SITES } from "@/lib/landing-data";

function RelatedSiteItem({ name, url }: { name: string; url: string }) {
  if (url) {
    return (
      <a className="related-site" href={url} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    );
  }

  return (
    <span className="related-site related-site--pending" aria-disabled="true">
      {name}
    </span>
  );
}

export function RelatedSitesBand() {
  const marqueeItems = [...RELATED_SITES, ...RELATED_SITES];

  return (
    <section className="related-sites-sec" id="related-sites" aria-label="관련사이트">
      <div className="related-sites-band">
        <div className="related-sites-head">
          <h3>관련사이트</h3>
        </div>
        <div className="related-sites-marquee" aria-label="관련사이트 목록">
          <div className="related-sites-track">
            {marqueeItems.map((site, index) => (
              <RelatedSiteItem key={`${site.name}-${index}`} name={site.name} url={site.url} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
