import { Layout } from '@/components/layout/Layout';
import { ButtonDemo } from '@/components/examples/ButtonDemo';
import { CardDemo } from '@/components/examples/CardDemo';
import { spacing, typography } from '@/theme';

export default function DesignSystem() {
  return (
    <Layout>
      <h2 className={`${typography.h2} ${spacing.margin.bottom}`}>Design System</h2>
      <div className={`flex flex-col items-center ${spacing.gap.medium} w-full`}>
        <ButtonDemo />
        <CardDemo />
      </div>
    </Layout>
  );
}

