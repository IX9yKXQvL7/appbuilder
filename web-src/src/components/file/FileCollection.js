import React from 'react';
import {
  CardView,
  Collection,
  SkeletonCollection,
  Card,
  CardPreview,
  Image,
  Content,
  Text,
  Avatar,
  Heading,
  Divider,
  Badge,
  useAsyncList
} from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
// import GuideSection from './GuideSection';

const PICSUM_API = 'https://picsum.photos/v2/list';

function PhotoCard({ item, layout }) {
  const description = item.author ? `Photo by ${item.author}` : 'Placeholder';
  const avatarSize = layout === 'waterfall' ? 24 : 32;
  const avatarSrc = item.download_url
    ? `https://picsum.photos/id/${item.id}/64/64`
    : null;
  return (
    <Card id={String(item.id)} textValue={description}>
      {({ size }) => (
        <>
          <CardPreview>
            <Image
              src={item.download_url}
              width={item.width}
              height={item.height}
              styles={style({
                width: 'full',
                pointerEvents: 'none',
                objectFit: 'cover'
              })}
            />
          </CardPreview>
          <Content>
            <Text slot="title">{description}</Text>
            <div className={style({ display: 'flex', alignItems: 'center', gap: 8, gridArea: 'description' })}>
              <Avatar
                src={avatarSrc}
                size={size === 'S' ? 24 : size === 'M' ? 32 : size === 'L' ? 40 : avatarSize}
              />
              <Text slot="description">{item.author}</Text>
            </div>
          </Content>
        </>
      )}
    </Card>
  );
}

export default function PhotoGallery() {
  const list = useAsyncList({
    async load({ signal, cursor, items }) {
      const page = cursor || 1;
      const res = await fetch(`${PICSUM_API}?page=${page}&limit=30`, { signal });
      const nextItems = await res.json();
      const existingKeys = new Set(items.map((i) => i.id));
      const filtered = nextItems.filter((i) => !existingKeys.has(String(i.id)));
      return { items: filtered, cursor: filtered.length ? page + 1 : null };
    }
  });

  return (
    <div className={style({ width: 'full' })}>
      <div className={style({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8
      })}>
        <Heading level={1} styles={style({ margin: 0 })}>
          Photo Gallery
        </Heading>
        <Badge variant="positive" size="S">CardView</Badge>
      </div>
      <Text styles={style({ font: 'body-lg', color: 'gray-700', display: 'block', marginBottom: 24 })}>
        Infinite-scrolling photo grid using React Spectrum S2 CardView, useAsyncList, and SkeletonCollection.
        Images from Picsum Photos (https://picsum.photos) — no API key required.
      </Text>
      <Divider />

      <div className={style({ marginTop: 24 })}>
        <CardView
          aria-label="Photo gallery"
          size="S"
          layout="waterfall"
          loadingState={list.loadingState}
          onLoadMore={list.loadMore}
          styles={style({ width: 'full', height: 500 })}
        >
          <Collection items={list.loadingState === 'loading' ? [] : list.items}>
            {(item) => <PhotoCard item={item} layout="waterfall" />}
          </Collection>
          {(list.loadingState === 'loading' || list.loadingState === 'loadingMore') && (
            <SkeletonCollection>
              {() => (
                <PhotoCard
                  item={{
                    id: String(Math.random()),
                    author: 'Loading…',
                    download_url: '',
                    width: 400,
                    height: 200 + Math.max(0, Math.round(Math.random() * 400))
                  }}
                  layout="waterfall"
                />
              )}
            </SkeletonCollection>
          )}
        </CardView>
      </div>

    </div>
  );
}
