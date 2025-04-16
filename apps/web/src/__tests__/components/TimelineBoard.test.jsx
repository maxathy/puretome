import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import TimelineBoard from '../../components/TimelineBoard';

describe('TimelineBoard Component', () => {
  // Mock memoir data
  const mockMemoir = {
    _id: '67fd6433e5bbf10bbd28ffe4',
    title: 'My Memoir',
    chapters: [
      {
        title: 'Chapter 1',
        events: [
          { title: 'Event 1', content: 'Description 1' },
          { title: 'Event 2', content: 'Description 2' },
        ],
      },
    ],
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock API responses
    axios.get.mockResolvedValue({ data: mockMemoir });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });
  });

  it('fetches and displays memoir data', async () => {
    render(<TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />);

    // Check API call
    expect(axios.get).toHaveBeenCalledWith(
      '/api/memoir/67fd6433e5bbf10bbd28ffe4',
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching memoir:',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  // it('persists timeline changes', async () => {
  //   render(<TimelineBoard memoirId="67fd6433e5bbf10bbd28ffe4" />);
  //
  //   // Wait for data to load
  //   await waitFor(() => {
  //     expect(screen.getByText('Chapter 1')).toBeInTheDocument();
  //   });
  //
  //   // Access the component's persistTimeline method directly
  //   // Note: In a real test, you'd trigger this through user interactions
  //   // This is a simplified example
  //   const updatedMemoir = {
  //     ...mockMemoir,
  //     title: 'Updated Memoir',
  //   };
  //
  //   // Call directly - in real tests you'd use fireEvent
  //   // We'd need to expose this method or trigger it through UI interaction
  //   // This is just demonstrating the concept
  //   await TimelineBoard.prototype.persistTimeline(updatedMemoir);
  //
  //   expect(axios.post).toHaveBeenCalledWith('/api/memoir', updatedMemoir);
  // });
});
