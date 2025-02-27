import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Tabs Component', () => {
    test('applies custom className to tabs components', () => {
        render(
            <Tabs defaultValue="tab1">
                <TabsList className="custom-list">
                    <TabsTrigger className="custom-trigger" value="tab1">Tab 1</TabsTrigger>
                </TabsList>
                <TabsContent className="custom-content" value="tab1">Content</TabsContent>
            </Tabs>
        );

        expect(screen.getByRole('tablist')).toHaveClass('custom-list');
        expect(screen.getByRole('tab')).toHaveClass('custom-trigger');
        expect(screen.getByText('Content')).toHaveClass('custom-content');
    });

    test('disables tab triggers when disabled prop is provided', () => {
        render(
            <Tabs defaultValue="tab1">
                <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content for Tab 1</TabsContent>
            </Tabs>
        );

        expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeDisabled();
    });

    test('renders initial tab content correctly', () => {
        render(
            <Tabs defaultValue="tab1">
                <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content for Tab 1</TabsContent>
                <TabsContent value="tab2">Content for Tab 2</TabsContent>
            </Tabs>
        );

        // Check that the initial content is displayed
        expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();

    });
});