import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  FaqAccordionItem,
  FaqAccordionList,
} from '@/components/platform/faq-accordion';
import type { FaqItem } from '@/lib/platform/faqData';

const buildItem = (overrides: Partial<FaqItem> = {}): FaqItem => ({
  id: 'faq-item',
  number: '01',
  question: 'كيف يتم ضمان جودة التعديلات البرمجية؟',
  answer: 'يتم ذلك عبر اختبارات متكررة والتحقق من الأنواع.',
  ...overrides,
});

describe('FaqAccordionItem', () => {
  it('starts closed by default and toggles answer visibility when clicked', async () => {
    const user = userEvent.setup();
    const item = buildItem();

    render(<FaqAccordionItem item={item} />);

    const trigger = screen.getByRole('button', {
      name: /كيف يتم ضمان جودة التعديلات البرمجية؟/i,
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('يتم ذلك عبر اختبارات متكررة والتحقق من الأنواع.'),
    ).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('يتم ذلك عبر اختبارات متكررة والتحقق من الأنواع.'),
    ).toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('يتم ذلك عبر اختبارات متكررة والتحقق من الأنواع.'),
    ).not.toBeInTheDocument();
  });

  it('renders expanded content immediately when defaultOpen is true', () => {
    const item = buildItem({
      answer: 'يظهر هذا الجواب مباشرة عند التهيئة.',
    });

    render(<FaqAccordionItem item={item} defaultOpen />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('يظهر هذا الجواب مباشرة عند التهيئة.'),
    ).toBeInTheDocument();
  });
});

describe('FaqAccordionList', () => {
  it('opens only the first item by default when defaultOpenFirst is enabled', () => {
    const items = [
      buildItem({
        id: 'first',
        number: '01',
        question: 'السؤال الأول',
        answer: 'الجواب الأول',
      }),
      buildItem({
        id: 'second',
        number: '02',
        question: 'السؤال الثاني',
        answer: 'الجواب الثاني',
      }),
    ];

    render(<FaqAccordionList items={items} />);

    const triggers = screen.getAllByRole('button');

    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('الجواب الأول')).toBeInTheDocument();
    expect(screen.queryByText('الجواب الثاني')).not.toBeInTheDocument();
  });

  it('keeps all items collapsed when defaultOpenFirst is disabled', () => {
    const items = [
      buildItem({
        id: 'first-collapsed',
        question: 'سؤال مغلق 1',
        answer: 'جواب مغلق 1',
      }),
      buildItem({
        id: 'second-collapsed',
        number: '02',
        question: 'سؤال مغلق 2',
        answer: 'جواب مغلق 2',
      }),
    ];

    render(<FaqAccordionList items={items} defaultOpenFirst={false} />);

    const triggers = screen.getAllByRole('button');

    expect(triggers[0]).toHaveAttribute('aria-expanded', 'false');
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('جواب مغلق 1')).not.toBeInTheDocument();
    expect(screen.queryByText('جواب مغلق 2')).not.toBeInTheDocument();
  });
});
