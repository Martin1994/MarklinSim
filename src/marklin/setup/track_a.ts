import { MarklinController } from '../marklin_controller';
import { Train } from '../../model/train';
import { Track } from '../../model/track';
import { TrackFactory } from './track_factory';

export class MarklinTrackA {
    public static setup(controller: MarklinController): void {
        const trains: Train[] = [];
        const tracks: Track[] = [];

        // Create trains
        trains[24] = new Train(24);
        trains[58] = new Train(58);
        trains[71] = new Train(71);

        // Create tracks
        tracks[0x100] = TrackFactory.straight(0x100, 150, 100, 650, 100);
        tracks[0x101] = TrackFactory.quadrant(0x101, 650, 100, 700, 150);
        tracks[0x102] = TrackFactory.straight(0x102, 700, 150, 700, 450);
        tracks[0x103] = TrackFactory.quadrant(0x103, 700, 450, 650, 500);
        tracks[0x104] = TrackFactory.straight(0x104, 650, 500, 150, 500);
        tracks[0x105] = TrackFactory.quadrant(0x105, 150, 500, 100, 450);
        tracks[0x106] = TrackFactory.straight(0x106, 100, 450, 100, 150);
        tracks[0x107] = TrackFactory.quadrant(0x107, 100, 150, 150, 100);

        // Connect tracks
        Track.connect(tracks[0x100], false, tracks[0x101], true);
        Track.connect(tracks[0x101], false, tracks[0x102], true);
        Track.connect(tracks[0x102], false, tracks[0x103], true);
        Track.connect(tracks[0x103], false, tracks[0x104], true);
        Track.connect(tracks[0x104], false, tracks[0x105], true);
        Track.connect(tracks[0x105], false, tracks[0x106], true);
        Track.connect(tracks[0x106], false, tracks[0x107], true);
        Track.connect(tracks[0x107], false, tracks[0x100], true);

        // Put trains on tracks
        trains[24].putOnTrack(tracks[0x100], true);
        trains[58].putOnTrack(tracks[0x100], true);
        trains[71].putOnTrack(tracks[0x100], true);

        for (const train of trains) {
            if (!train) {
                continue;
            }
            controller.registerTrain(train);
        }
        for (const track of tracks) {
            if (!track) {
                continue;
            }
            controller.registerTrack(track);
        }
    }
}
