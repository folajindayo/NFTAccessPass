import { ButtonDemo } from '@/components/examples/ButtonDemo';
import { CardDemo } from '@/components/examples/CardDemo';
import { FormDemo } from '@/components/examples/FormDemo';
import { Layout } from '@/components/layout/Layout';
import { LayoutDemo } from '@/components/examples/LayoutDemo';
import { spacing, typography } from '@/theme';

export default function DesignSystem() {
  return (
    <Layout>
      <h2 className={`${typography.h2} ${spacing.margin.bottom}`}>Design System</h2>
      <div className={`flex flex-col items-center ${spacing.gap.medium} w-full max-w-4xl`}>
        <ButtonDemo />
        <CardDemo />
        <LayoutDemo />
        <FormDemo />
      </div>
    </Layout>
  );
}
