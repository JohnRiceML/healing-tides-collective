import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary used on listings + meta description fallback',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              if (parent?.asset && !value) return 'Alt text required when image set'
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                  defineField({
                    name: 'blank',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', type: 'string', title: 'Alternative text'}),
            defineField({name: 'caption', type: 'string'}),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'table',
          title: 'Table',
          fields: [
            defineField({
              name: 'columns',
              type: 'array',
              title: 'Column Headers',
              description: 'Define the column headers for your table',
              of: [{type: 'string'}],
              validation: (rule) => rule.min(1).max(10),
            }),
            defineField({
              name: 'rows',
              type: 'array',
              title: 'Table Rows',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'row',
                  title: 'Row',
                  fields: [
                    defineField({
                      name: 'cells',
                      type: 'array',
                      title: 'Row Cells',
                      of: [{type: 'string'}],
                      description: 'Add cells for each column in the order defined above',
                    }),
                  ],
                }),
              ],
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Table Caption',
              description: 'Optional table caption for accessibility',
            }),
          ],
          preview: {
            select: {rows: 'rows', columns: 'columns'},
            prepare({rows, columns}) {
              const cols = (columns as unknown[] | undefined) ?? []
              const rws = (rows as unknown[] | undefined) ?? []
              return {
                title: `Table with ${cols.length} columns and ${rws.length} rows`,
                subtitle: cols.length ? `Columns: ${(cols as string[]).join(', ')}` : 'No columns defined',
              }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'youtube',
          title: 'YouTube Video',
          fields: [
            defineField({
              name: 'url',
              type: 'url',
              title: 'YouTube URL',
              description: 'Paste the full YouTube video URL (e.g., https://www.youtube.com/watch?v=...)',
              validation: (rule) =>
                rule
                  .required()
                  .uri({scheme: ['https'], allowRelative: false})
                  .custom((url) => {
                    if (!url) return true
                    const youtubeRegex =
                      /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/
                    if (!youtubeRegex.test(url)) {
                      return 'Please enter a valid YouTube URL'
                    }
                    return true
                  }),
            }),
          ],
          preview: {
            select: {url: 'url'},
            prepare({url}) {
              const videoId = (url as string | undefined)?.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
              )?.[1]
              return {
                title: 'YouTube Video',
                subtitle: videoId ? `Video ID: ${videoId}` : 'No URL provided',
              }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'qa',
          title: 'Q&A Box',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              title: 'Question',
              description: 'The question text',
              validation: (rule) => rule.required().min(10).max(200),
            }),
            defineField({
              name: 'answer',
              type: 'text',
              title: 'Answer',
              description: 'The answer text',
              rows: 5,
              validation: (rule) => rule.required().min(20),
            }),
          ],
          preview: {
            select: {question: 'question', answer: 'answer'},
            prepare({question, answer}) {
              const a = (answer as string | undefined) ?? ''
              return {
                title: (question as string | undefined) || 'Q&A',
                subtitle: a ? `${a.substring(0, 60)}...` : 'No answer provided',
              }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'faqSection',
          title: 'FAQ Section',
          description: 'Multiple FAQs with automatic schema markup generation for SEO',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Section Title',
              description: 'Optional title for the FAQ section',
              initialValue: 'Frequently Asked Questions',
            }),
            defineField({
              name: 'faqs',
              type: 'array',
              title: 'FAQs',
              description: 'Add multiple frequently asked questions and answers',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'faqItem',
                  title: 'FAQ Item',
                  fields: [
                    defineField({
                      name: 'question',
                      type: 'string',
                      title: 'Question',
                      validation: (rule) => rule.required().min(10).max(300),
                    }),
                    defineField({
                      name: 'answer',
                      type: 'text',
                      title: 'Answer',
                      rows: 5,
                      validation: (rule) => rule.required().min(20),
                    }),
                  ],
                  preview: {
                    select: {question: 'question', answer: 'answer'},
                    prepare({question, answer}) {
                      const a = (answer as string | undefined) ?? ''
                      return {
                        title: (question as string | undefined) || 'Untitled FAQ',
                        subtitle: a ? `${a.substring(0, 50)}...` : 'No answer',
                      }
                    },
                  },
                }),
              ],
              validation: (rule) => rule.min(1).max(20),
            }),
          ],
          preview: {
            select: {title: 'title', faqs: 'faqs'},
            prepare({title, faqs}) {
              const list = (faqs as unknown[] | undefined) ?? []
              return {
                title: (title as string | undefined) || 'FAQ Section',
                subtitle: `${list.length} FAQ items`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'Canonical URL for SEO (leave empty to use default)',
    }),
    defineField({
      name: 'structuredData',
      title: 'Schema Markup (JSON-LD)',
      type: 'text',
      description:
        'Custom structured data for SEO. Must be valid JSON-LD with @context and @type. Leave empty to auto-generate Article schema.',
      rows: 8,
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          try {
            const parsed = JSON.parse(value as string)
            if (
              typeof parsed !== 'object' ||
              parsed === null ||
              !(parsed as Record<string, unknown>)['@context'] ||
              !(parsed as Record<string, unknown>)['@type']
            ) {
              return 'Schema must be valid JSON-LD with @context and @type properties'
            }
            return true
          } catch {
            return 'Invalid JSON format. Please check your syntax.'
          }
        }),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'metaTitle', type: 'string', validation: (rule) => rule.max(70)}),
        defineField({name: 'metaDescription', type: 'text', rows: 3, validation: (rule) => rule.max(160)}),
        defineField({
          name: 'ogImage',
          title: 'Open Graph image',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'author.name', media: 'heroImage'},
  },
})
